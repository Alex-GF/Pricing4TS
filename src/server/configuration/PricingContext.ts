import { Feature, Pricing, UsageLimit } from "../../types";
import { PricingPlanEvaluationError } from "../exceptions/PricingPlanEvaluationError";
import { retrievePricingFromPath } from "../server";

export type SubscriptionContext = Record<"features" | "usageLimits", Record<string, Feature | UsageLimit>>;

/**
 * An abstract class from which to create a component that adapts the pricing
 * configuration to the application domain
 */
export abstract class PricingContext {
    /**
     * Returns path of the pricing configuration YAML file.
     * This file should be located in the resources folder, and the path should be
     * relative to it.
     * 
     * @returns Configuration file path
     */
    abstract getConfigFilePath(): string;

    /**
     * Returns the secret used to encode the pricing JWT.
     * 
     * @returns JWT secret string
     */
    abstract getJwtSecret(): string;

    /**
     * Returns the expiration time of the JWT in milliseconds
     * 
     * @returns JWT expiration time in milliseconds
     */
    getJwtExpiration(): number {
        return 86400000;
    }

    /**
     * This method can be used to determine which users are affected
     * by the pricing, so a pricing-driven JWT will be only generated
     * for them.
     * 
     * @returns A boolean indicating the condition to include or exclude the pricing evaluation context in the JWT.
     */
    userAffectedByPricing(): boolean {
        return true;
    }

    /**
     * This method should return the user context that will be used to evaluate the pricing plan.
     * It should consider which users have accessed the service and what
     * information is available.
     * 
     * @returns Map with the user context
     */
    abstract getUserContext(): Record<string, boolean | string | number>;

    /**
     * This method should return the plan name of the current user.
     * With this information, the library will be able to build the Plan
     * object of the user from the configuration.
     * 
     * @returns String with the current user's plan name
     */
    abstract getUserPlan(): string;

    /**
     * This method returns the plan context of the current user, represented by a
     * *Record<string, boolean | string | number | PaymentType[]>*. It's used to evaluate the pricing plan.
     * 
     * @return current user's plan context
     */
    getPlanContext(): SubscriptionContext {
        const userPlan = this.getPricing().plans![this.getUserPlan()];

        return {
            features: userPlan.features,
            usageLimits: userPlan.usageLimits ?? {},
        };
    }

    /**
     * This method returns the PricingManager object that is being used to
     * evaluate the pricing plan.
     * 
     * @returns PricingManager object
     */
    getPricing(): Pricing {
        try {
            return retrievePricingFromPath(this.getConfigFilePath());
        } catch (error) {
            throw new PricingPlanEvaluationError((error as Error).message);
        }
    }
}