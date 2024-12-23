import { PricingContext } from "../configuration/PricingContext";
import { PricingContextManager } from "../server";
import {PricingPlanEvaluationError} from "../exceptions/PricingPlanEvaluationError";
import { encode } from "jwt-simple";
import { Feature, Pricing } from "../../main";

export function generateUserToken(){
    const pricingContext: PricingContext = PricingContextManager.getContext();
    const claims: any = {};

    let subject = "Default";

    if (pricingContext.getUserContext().username || pricingContext.getUserContext().user){
        subject = String(pricingContext.getUserContext().username ?? pricingContext.getUserContext().user);
    }

    claims.sub = subject;

    try {
        claims.userContext = pricingContext.getUserContext();
    } catch (e) {
        throw new PricingPlanEvaluationError("Error while retrieving user context! Please check your PricingContext.getUserContext() method");
    }

    if (!pricingContext.userAffectedByPricing()) {
        return encode(claims, pricingContext.getJwtSecret(), 'RS256', {header: {alg: 'RS256', typ: "JWT"}});
    }

    const pricing: Pricing = pricingContext.getPricing();

    const features: Record<string, Feature> = pricing.features;

    const planContext: Record<string, any> = pricing.plans![pricingContext.getUserPlan()] ?? {};
    // Map<String, FeatureStatus> featureStatuses = computeFeatureStatuses(planContextManager, features);

    // claims.put("features", featureStatuses);
    // claims.put("planContext", planContextManager.getPlanContext());

    // return Jwts.builder()
    //     .setClaims(claims)
    //     .setSubject(subject)
    //     .setIssuedAt(new Date(System.currentTimeMillis()))
    //     .setExpiration(new Date(System.currentTimeMillis() + pricingContext.getJwtExpiration()))
    //     .signWith(SignatureAlgorithm.HS512, pricingContext.getJwtSecret())
    //     .compact();
}