import { Feature } from "../../types";
import { PricingContext, SubscriptionContext } from "../configuration/PricingContext";
import { PricingContextManager } from "../server";
import { ContextToEval, extractContextToEvalFromSubscriptionContext } from "../utils/pricing-evaluator";

export function PricingAware(featureName: string) {
    return function (
      target: any,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor
    ) {
      const originalMethod = descriptor.value;
  
      descriptor.value = function (...args: any[]) {
  
        const pricingContext: PricingContext = PricingContextManager.getContext();
  
        const evaluationResult: boolean = evaluateContext(pricingContext, featureName);

        if (!evaluationResult) {
          throw new Error(`Feature ${featureName} is not enabled for the current user!`);
        }

        // Si pasa las validaciones, llama a la función original
        return originalMethod.apply(this, args);
      };
  
      return descriptor;
    };
  }

function evaluateContext(pricingContext: PricingContext, featureName: string): boolean {
    
    const subscriptionContext: SubscriptionContext = pricingContext.getPlanContext();

    const featureToEval: Feature = subscriptionContext.features[featureName] as Feature;
    const evaluationExpression: string | undefined = featureToEval.serverExpression ?? featureToEval.expression;

    if (!evaluationExpression) {
      console.warn(`[WARNING] Feature ${featureName} has no expression defined!`);
      return false;
    }

    const userContext: Record<string, any> = pricingContext.getUserContext();
    const planContext: ContextToEval = extractContextToEvalFromSubscriptionContext(subscriptionContext);

    const evalResult: Boolean = eval(evaluationExpression);

    if (typeof evalResult !== 'boolean') {
      console.warn(
        `[WARNING] Feature ${featureName} has an expression that does not return a boolean!`
      );
      return false;
    }

    return evalResult;
}