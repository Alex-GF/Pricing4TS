import { ContainerFeatures, Feature } from './feature';
import { ContainerUsageLimits, UsageLimit } from './usage-limit';
import { ContainerPlans, Plan } from './plan';
import { AddOn, ContainerAddOns } from './addon';

export interface Pricing {
    saasName: string;
    version: string;
    createdAt: Date;
    currency: string;
    hasAnnualPayment: boolean;
    tags?: string[];
    features: Feature[];
    usageLimits?: UsageLimit[];
    plans?: Plan[];
    addOns?: AddOn[];
}

export interface ExtractedPricing extends Omit<Pricing, 'version' | 'createdAt'> {
    version: string;
    createdAt: string | Date;
}

export interface PricingToBeWritten extends Omit<Pricing, 'features' | 'usageLimits' | 'plans' | 'addOns'> {
    features: ContainerFeatures,
    usageLimits?: ContainerUsageLimits;
    plans?: ContainerPlans;
    addOns?: ContainerAddOns;
}

export function generateEmptyPricing(): Pricing {
    return {
        saasName: "",
        version: "0.0",
        createdAt: new Date(),
        currency: "",
        hasAnnualPayment: false,
        features: [],
        usageLimits: [],
        plans: [],
        tags: [],
        addOns: []
    }
}

export function generateEmptyPricingToBeWritten(): PricingToBeWritten {
    return {
        saasName: "",
        version: "0.0",
        createdAt: new Date(),
        currency: "",
        hasAnnualPayment: false,
        features: {},
        usageLimits: {},
        plans: {},
        tags: [],
        addOns: {}
    }
}