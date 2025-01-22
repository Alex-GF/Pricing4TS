import { PricingContext, SubscriptionContext } from '../configuration/PricingContext';
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

export type ContextToEval = Record<
  'features' | 'usageLimits',
  Record<string, string | boolean | number | PaymentType[]>
>;

export function generateUserPricingToken() {
  const pricingContext: PricingContext = PricingContextManager.getContext();
  const claims: any = {};

  let subject = 'Default';

  const userContext: Record<string, any> = pricingContext.getUserContext();

  if (userContext.username || userContext.user) {
    subject = String(userContext.username ?? userContext.user);
  }

  claims.sub = subject;

  try {
    claims.userContext = userContext;
  } catch (e) {
    throw new PricingPlanEvaluationError(
      'Error while retrieving user context! Please check your PricingContext.getUserContext() method'
    );
  }

  if (!pricingContext.userAffectedByPricing()) {
    return PricingJwtUtils.encodeToken(claims);
  }

  const subscriptionContext: SubscriptionContext = pricingContext.getPlanContext();

  const featureStatuses: Record<string, FeatureStatus> = computeFeatureStatuses(
    subscriptionContext,
    userContext
  );

  claims.features = featureStatuses;
  claims.planContext = subscriptionContext;

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
  subscriptionContext: SubscriptionContext,
  userContext: Record<string, any>
): Record<string, FeatureStatus> {
  const featureStatuses: Record<string, FeatureStatus> = {};

  const planContext: ContextToEval =
    extractContextToEvalFromSubscriptionContext(subscriptionContext); // This is defined in order to perform the "eval"

  for (const feature of Object.values(subscriptionContext.features) as Feature[]) {
    featureStatuses[feature.name] = evaluateFeature(
      feature,
      subscriptionContext,
      userContext,
      planContext
    );
  }

  return featureStatuses;
}

export function extractContextToEvalFromSubscriptionContext(
  subscriptionContext: SubscriptionContext
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
  subscriptionContext: SubscriptionContext | undefined = undefined,
  userContext: Record<string, any> | undefined = undefined,
  planContext: ContextToEval | undefined = undefined
): FeatureStatus {
  const pricingContext = PricingContextManager.getContext();

  if (typeof feature === 'string') {
    feature = pricingContext.getPricing().features[feature] as Feature;
  }

  const featureExpression: string | undefined = feature.serverExpression ?? feature.expression;

  if (!featureExpression) {
    console.warn(`[WARNING] Feature ${feature.name} has no expression defined!`);
    return {
      eval: false,
      used: null,
      limit: null,
    };
  } else {
    if (!subscriptionContext) {
      subscriptionContext = pricingContext.getPlanContext();
    }

    if (!userContext) {
      userContext = pricingContext.getUserContext();
    }

    if (!planContext) {
      planContext = extractContextToEvalFromSubscriptionContext(subscriptionContext);
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
      };
    } else {
      if (evalResult !== null && evalResult !== undefined) {
        const numericLimitsOfSelectedFeature: UsageLimit[] = (
          Object.values(subscriptionContext.usageLimits) as UsageLimit[]
        ).filter(u => u.linkedFeatures?.includes(feature.name) && u.valueType === 'NUMERIC');

        const shouldLimitAppearInToken: boolean = numericLimitsOfSelectedFeature.length === 1;

        return {
          eval: evalResult,
          used: shouldLimitAppearInToken ? userContext[feature.name] ?? null : null,
          limit: shouldLimitAppearInToken
            ? numericLimitsOfSelectedFeature[0].value ??
              numericLimitsOfSelectedFeature[0].defaultValue
            : null,
        };
      } else {
        return {
          eval: false,
          used: null,
          limit: null,
        };
      }
    }
  }
}
