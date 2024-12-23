import { PlanContext, PricingContext } from "../configuration/PricingContext";
import { PricingContextManager } from "../server";
import {PricingPlanEvaluationError} from "../exceptions/PricingPlanEvaluationError";
import { encode } from "jwt-simple";
import { Feature, Pricing } from "../../main";

interface FeatureStatus {
    eval: boolean,
    used: string | number | boolean,
    limit: string | number | boolean
}

export function generateUserToken(){
    const pricingContext: PricingContext = PricingContextManager.getContext();
    const claims: any = {};

    let subject = "Default";

    if (pricingContext.getUserContext().username || pricingContext.getUserContext().user){
        subject = String(pricingContext.getUserContext().username ?? pricingContext.getUserContext().user);
    }

    claims.sub = subject;

    const userContext: Record<string, any> = pricingContext.getUserContext();

    try {
        claims.userContext = userContext;
    } catch (e) {
        throw new PricingPlanEvaluationError("Error while retrieving user context! Please check your PricingContext.getUserContext() method");
    }

    if (!pricingContext.userAffectedByPricing()) {
        return encode(claims, pricingContext.getJwtSecret(), 'RS256', {header: {alg: 'RS256', typ: "JWT"}});
    }

    const pricing: Pricing = pricingContext.getPricing();

    const features: Record<string, Feature> = pricing.features;

    const planContext: PlanContext = pricingContext.getPlanContext();

    const featureStatuses: Record<string, FeatureStatus> = computeFeatureStatuses(planContext, userContext, features);

    claims.features = featureStatuses;
    claims.planContext = pricingContext.getPlanContext();
    claims.exp = Math.floor(Date.now()) + pricingContext.getJwtExpiration();

    return encode(claims, pricingContext.getJwtSecret(), 'RS256', {header: {alg: 'RS256', typ: "JWT"}});
}

function computeFeatureStatuses(planContext: Record<string, any>, userContext: Record<string, any>, features: Record<string, Feature>): Record<string, FeatureStatus> {
    const featureStatuses: Record<string, FeatureStatus> = {};

    // TODO: Implement this method

    return featureStatuses;
}