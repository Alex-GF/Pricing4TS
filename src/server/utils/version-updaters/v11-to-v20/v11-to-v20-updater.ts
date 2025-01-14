// deno-lint-ignore-file no-explicit-any

import { formatObjectToArray } from "../../../../main/utils/pricing-formatting/pricing-parser";
import { calculateNextVersion } from "../../version-manager";

export default function v11Tov20Updater(extractedPricing: any): any {

    const nextVersion = calculateNextVersion(extractedPricing.version);

    extractedPricing.version = nextVersion!;

    _updatePrices(extractedPricing);
    _removeHasAnnualPayment(extractedPricing);

    return extractedPricing;
}

function _removeHasAnnualPayment(extractedPricing: any): void{
    extractedPricing.hasAnnualPayment = undefined;
}

function _updatePrices(extractedPricing: any): void {
    
    if (extractedPricing.plans !== null && extractedPricing.plans !== undefined){
        const pricingPlans = formatObjectToArray(extractedPricing.plans) as any;
        extractedPricing.billing = {};
        for (const plan of pricingPlans) {
            if (plan.monthlyPrice && plan.annualPrice){
                plan.price = plan.monthlyPrice;
                const annualBillingCoef = _computeAnnualBillingCoef(plan.monthlyPrice, plan.annualPrice);
                extractedPricing.billing = {"monthly": 1, "annual": annualBillingCoef, ...extractedPricing.billing}; 
            }else if (plan.monthlyPrice === null || plan.monthlyPrice === undefined) {
                plan.price = plan.annualPrice;
                extractedPricing.billing = {"annual": 1, ...extractedPricing.billing};
            }else{
                plan.price = plan.monthlyPrice;
                extractedPricing.billing = {"monthly": 1, ...extractedPricing.billing};
            }
    
            if (plan.price === null || plan.price === undefined) {
                throw new Error("Monthly or annual price is required for each plan");
            }

            plan.monthlyPrice = undefined;
            plan.annualPrice = undefined;
        }
        extractedPricing.plans = pricingPlans;
    }

    if (extractedPricing.addOns !== null && extractedPricing.addOns !== undefined){
        
        const pricingAddons = formatObjectToArray(extractedPricing.addOns) as any;
        for (const addon of pricingAddons) {
    
            if (addon.price !== null && addon.price !== undefined) continue;
    
            if (addon.monthlyPrice === null || addon.monthlyPrice === undefined) {
                addon.price = addon.annualPrice;
                extractedPricing.billing = {"annual": 1, ...extractedPricing.billing};
            }else{
                addon.price = addon.monthlyPrice;
                extractedPricing.billing = {"monthly": 1, ...extractedPricing.billing};
            }
    
            if (addon.price === null || addon.price === undefined) {
                throw new Error("Monthly or annual price is required for each addon");
            }

            addon.monthlyPrice = undefined;
            addon.annualPrice = undefined;
        }
        extractedPricing.addOns = pricingAddons;
    }
}

function _computeAnnualBillingCoef(monthlyPrice: any, annualPrice: any): number {
    
    if (typeof monthlyPrice !== "number" || typeof annualPrice !== "number") {
        throw new Error("Monthly and annual prices of plans must be numbers");
    }

    let annualBillingCoef = 0;

    if (annualPrice > monthlyPrice){
        console.log("[WARNING UPDATER_v11_v20] Annual price is greater than monthly price. Annual billing coefficient will be calculated considering annualPrice correspond to the annual payment, it is: annualBillingCoef = annualPrice / (monthlyPrice * 12)");
        annualBillingCoef = annualPrice / (monthlyPrice * 12);
    }else{
        annualBillingCoef = annualPrice / monthlyPrice;
    }
    
    return annualBillingCoef;
}