import { Feature } from "../../types";
import { PricingContext, Configuration } from "../configuration/PricingContext";
import { PricingContextManager } from "../server";
import { ContextToEval, extractContextToEvalFromSubscriptionContext } from "../utils/pricing-evaluator";

export type ClassMethodDecoratorContextType = {
    kind: 'method';
    name: string | symbol;
    access: { get(object: unknown): unknown };
    static: boolean;
    private: boolean;
    addInitializer(initializer: () => void): void;
  };

export function PricingAware(featureName: string) {
    return function (
      target: any,
      context: ClassMethodDecoratorContextType
    ) {

        if (context.kind !== 'method') {
            throw new Error('PricingAware decorator can only be applied to methods!');
        }

      return function (this: any, ...args: any[]): any {
  
        const pricingContext: PricingContext = PricingContextManager.getContext();
  
        const evaluationResult: boolean = evaluateContext(pricingContext, featureName);

        if (!evaluationResult) {
          throw new Error(`Feature ${featureName} is not enabled for the current user!`);
        }

        // Si pasa las validaciones, llama a la función original
        return target.apply(this, args);
      };
    };
  }

function evaluateContext(evaluationContext: PricingContext, featureName: string): boolean {
    
    const configuration: Configuration = evaluationContext.getPlanContext();

    const featureToEval: Feature = configuration.features[featureName] as Feature;
    const evaluationExpression: string | undefined = featureToEval.serverExpression ?? featureToEval.expression;

    if (!evaluationExpression) {
      console.warn(`[WARNING] Feature ${featureName} has no expression defined!`);
      return false;
    }

    const subscriptionContext: Record<string, any> = evaluationContext.getSubscriptionContext();
    const pricingContext: ContextToEval = extractContextToEvalFromSubscriptionContext(configuration);

    const evalResult: Boolean = eval(evaluationExpression);

    if (typeof evalResult !== 'boolean') {
      console.warn(
        `[WARNING] Feature ${featureName} has an expression that does not return a boolean!`
      );
      return false;
    }

    return evalResult;
}