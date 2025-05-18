import { Configuration, PricingContext } from '../configuration/PricingContext';
import { PricingContextManager } from '../server';
import { PricingPlanEvaluationError } from '../exceptions/PricingPlanEvaluationError';
import { Feature, UsageLimit } from '../../types';
import { PricingJwtUtils } from './pricing-jwt-utils';
import { PaymentType } from '../../main/models/pricing2yaml/feature';

export interface FeatureStatus {
  eval: Boolean | string;
  used: string | number | boolean | null;
  limit: string | number | boolean | null;
}

export interface ExtendedFeatureStatus extends FeatureStatus{
  error: {
    code: string;
    message: string;
  } | null;
}

export type ContextToEval = Record<
  'features' | 'usageLimits',
  Record<string, string | boolean | number | PaymentType[]>
>;

export function generateUserPricingToken() {
  const pricingContext: PricingContext = PricingContextManager.getContext();
  const claims: any = {};

  let subject = 'Default';

  const subscriptionContext: Record<string, any> = pricingContext.getSubscriptionContext();

  if (subscriptionContext.username || subscriptionContext.user) {
    subject = String(subscriptionContext.username ?? subscriptionContext.user);
  }

  claims.sub = subject;

  try {
    claims.subscriptionContext = subscriptionContext;
  } catch (e) {
    throw new PricingPlanEvaluationError(
      'Error while retrieving user context! Please check your PricingContext.getSubscriptionContext() method'
    );
  }

  if (!pricingContext.userAffectedByPricing()) {
    return PricingJwtUtils.encodeToken(claims);
  }

  const configuration: Configuration = pricingContext.getPlanContext();

  const featureStatuses: Record<string, FeatureStatus> = computeFeatureStatuses(
    configuration,
    subscriptionContext
  );

  claims.features = featureStatuses;
  claims.pricingContext = configuration;

  const token: string = PricingJwtUtils.encodeToken(claims);

  return token;
}

/**
 * Modifies the given JWT by changing the evaluation of the specified feature
 * using a {@link string} expression that will be evaluated on the client side
 * of the application.
 *
 * @param token      The generated JWT returned by the
 *                   {@link generateUserPricingToken()} method.
 * @param featureId  The ID of a feature defined within the token body.
 * @param expression The expression for the feature that will replace its
 *                   current evaluation.
 * @returns A modified version of the provided JWT containing the new expression
 *          in the "eval" attribute of the specified feature.
 */
export function addExpressionToToken(token: string, featureId: string, expression: string) {
  const tokenFeatures: Record<string, FeatureStatus> =
    PricingJwtUtils.getFeaturesFromJwtToken(token);

  try {
    tokenFeatures[featureId].eval = expression;
  } catch (e) {
    console.error('[ERROR] Feature not found while trying to add expression to token!');
  }

  return PricingJwtUtils.updateTokenFeatures(token, tokenFeatures);
}

function computeFeatureStatuses(
  configuration: Configuration,
  subscriptionContext: Record<string, any>
): Record<string, FeatureStatus> {
  const featureStatuses: Record<string, FeatureStatus> = {};

  const pricingContext: ContextToEval =
    extractContextToEvalFromSubscriptionContext(configuration); // This is defined in order to perform the "eval"

  for (const feature of Object.values(configuration.features) as Feature[]) {
    const { error, ...featureStatusWithoutError }: ExtendedFeatureStatus = evaluateFeature(
      feature,
      configuration,
      subscriptionContext,
      pricingContext
    );
    
    featureStatuses[feature.name] = featureStatusWithoutError;
  }

  return featureStatuses;
}

export function extractContextToEvalFromSubscriptionContext(
  subscriptionContext: Configuration
): ContextToEval {
  const subscriptionContextFeatures: Record<string, Feature> =
    subscriptionContext.features as Record<string, Feature>;
  const subscriptionContextUsageLimits: Record<string, UsageLimit> =
    subscriptionContext.usageLimits as Record<string, UsageLimit>;

  const contextToEval: ContextToEval = { features: {}, usageLimits: {} };

  for (const feature of Object.values(subscriptionContextFeatures) as Feature[]) {
    contextToEval.features[feature.name] = feature.value ?? feature.defaultValue;
  }

  for (const usageLimit of Object.values(subscriptionContextUsageLimits) as UsageLimit[]) {
    contextToEval.usageLimits[usageLimit.name] = usageLimit.value ?? usageLimit.defaultValue;
  }

  return contextToEval;
}

export function evaluateFeature(
  feature: Feature | string,
  configuration: Configuration | undefined = undefined,
  subscriptionContext: Record<string, any> | undefined = undefined,
  pricingContext: ContextToEval | undefined = undefined
): ExtendedFeatureStatus {
  const evaluationContext = PricingContextManager.getContext();

  if (typeof feature === 'string') {
    feature = evaluationContext.getPricing().features[feature] as Feature;
    
    if (!feature) {
      console.warn(`[WARNING] Feature ${feature} not found!`);
      return {
        eval: false,
        used: null,
        limit: null,
        error: {
          code: 'FLAG_NOT_FOUND',
          message: `Feature ${feature} is not present in the pricing`,
        }
      };
    }
  }


  const featureExpression: string | undefined = feature.serverExpression ?? feature.expression;

  if (!featureExpression) {
    console.warn(`[WARNING] Feature ${feature.name} has no expression defined!`);
    return {
      eval: false,
      used: null,
      limit: null,
      error: {
        code: 'PARSE_ERROR',
        message: `Feature ${feature.name} has no expression defined!`,
      }
    };
  } else {
    if (!configuration) {
      configuration = evaluationContext.getPlanContext();
    }

    if (!subscriptionContext) {
      subscriptionContext = evaluationContext.getSubscriptionContext();
    }

    if (!pricingContext) {
      pricingContext = extractContextToEvalFromSubscriptionContext(configuration);
    }
    const evalResult: Boolean = eval(featureExpression);

    if (typeof evalResult !== 'boolean') {
      console.warn(
        `[WARNING] Feature ${feature.name} has an expression that does not return a boolean!`
      );
      return {
        eval: false,
        used: null,
        limit: null,
        error: {
          code: 'TYPE_MISMATCH',
          message: `Feature ${feature.name} has an expression that does not return a boolean!`,
        }
      };
    } else {
      if (evalResult !== null && evalResult !== undefined) {
        const numericLimitsOfSelectedFeature: UsageLimit[] = (
          Object.values(configuration.usageLimits) as UsageLimit[]
        ).filter(u => u.linkedFeatures?.includes(feature.name) && u.valueType === 'NUMERIC');

        const shouldLimitAppearInToken: boolean = numericLimitsOfSelectedFeature.length === 1;

        return {
          eval: evalResult,
          used: shouldLimitAppearInToken ? subscriptionContext[feature.name] ?? null : null,
          limit: shouldLimitAppearInToken
            ? numericLimitsOfSelectedFeature[0].value ??
              numericLimitsOfSelectedFeature[0].defaultValue
            : null,
          error: null,
        };
      } else {
        return {
          eval: false,
          used: null,
          limit: null,
          error: {
            code: 'GENERAL',
            message: `Error while evaluating expression for feature ${feature.name}. The returned expression is null or undefined`,
          }
        };
      }
    }
  }
}
