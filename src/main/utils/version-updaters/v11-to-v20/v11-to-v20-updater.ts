// deno-lint-ignore-file no-explicit-any

import { formatObjectToArray } from "../../pricing-formatting/pricing-parser";
import { calculateNextVersion } from "../../version-manager";

export default function v10Tov11Updater(extractedPricing: any): any {

    const nextVersion = calculateNextVersion(extractedPricing.version);

    extractedPricing.version = nextVersion!;

    _updatePrices(extractedPricing);

    return extractedPricing;
}

function _updatePrices(extractedPricing: any): void {
    
    if (extractedPricing.plans !== null && extractedPricing.plans !== undefined){
        const pricingPlans = formatObjectToArray(extractedPricing.plans) as any;
        for (const plan of pricingPlans) {
            plan.price = plan.monthlyPrice ?? plan.annualPrice;
    
            if (plan.price === null || plan.price === undefined) {
                throw new Error("Monthly or annual price is required for each plan");
            }
        }
        extractedPricing.plans = pricingPlans;
    }

    if (extractedPricing.addOns !== null && extractedPricing.addOns !== undefined){
        
        const pricingAddons = formatObjectToArray(extractedPricing.addOns) as any;
        for (const addon of pricingAddons) {
    
            if (addon.price !== null && addon.price !== undefined) continue;
    
            addon.price = addon.monthlyPrice ?? addon.annualPrice;
    
            if (addon.price === null || addon.price === undefined) {
                throw new Error("Monthly or annual price is required for each addon");
            }
        }
        extractedPricing.addOns = pricingAddons;
    }
}