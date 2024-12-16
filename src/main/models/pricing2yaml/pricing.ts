import { ContainerFeatures, Feature } from './feature';
import { ContainerUsageLimits, UsageLimit } from './usage-limit';
import { ContainerPlans, Plan } from './plan';
import { AddOn, ContainerAddOns } from './addon';

export interface Pricing {
    saasName: string;
    version: string;
    url?: string;
    createdAt: Date;
    currency: string;
    tags?: string[];
    billing?: {[key: string]: number};
    features: Feature[];
    usageLimits?: UsageLimit[];
    plans?: Plan[];
    addOns?: AddOn[];
}

export interface ExtractedPricing extends Omit<Pricing, 'version' | 'createdAt'> {
    version: string;
    createdAt: string | Date;
}

export interface PricingToBeWritten extends Omit<Pricing, 'createdAt' | 'features' | 'usageLimits' | 'plans' | 'addOns'> {
    createdAt: string;
    features: ContainerFeatures,
    usageLimits?: ContainerUsageLimits;
    plans?: ContainerPlans;
    addOns?: ContainerAddOns;
}

export function generateEmptyPricing(): Pricing {
    return {
        saasName: "",
        version: "0.0",
        url: "",
        createdAt: new Date(),
        currency: "",
        billing: {
            "monthly": 1,
        },
        tags: [],
        features: [],
        usageLimits: [],
        plans: [],
        addOns: []
    }
}

export function generateEmptyPricingToBeWritten(): PricingToBeWritten {
    return {
        saasName: "",
        version: "0.0",
        url: "",
        createdAt: "",
        currency: "",
        billing: {},
        tags: [],
        features: {},
        usageLimits: {},
        plans: {},
        addOns: {}
    }
}