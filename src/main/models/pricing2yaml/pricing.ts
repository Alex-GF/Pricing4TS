import { Feature } from './feature';
import { UsageLimit } from './usage-limit';
import { Plan } from './plan';
import { AddOn } from './addon';

export interface Pricing {
    saasName: string;
    syntaxVersion: string;
    version: string;
    url?: string;
    createdAt: Date;
    currency: string;
    tags?: string[];
    billing?: {[key: string]: number};
    variables: {[key: string]: number | string | boolean};
    features: Record<string, Feature>;
    usageLimits?: Record<string, UsageLimit>;
    plans?: Record<string, Plan>;
    addOns?: Record<string, AddOn>;
    custom?: {[key: string]: any};
}

export interface ExtractedPricing extends Omit<Pricing, 'syntaxVersion' | 'createdAt'> {
    syntaxVersion: string;
    createdAt: string | Date;
}

export interface PricingToBeWritten extends Omit<Pricing, 'createdAt' | 'features'> {
    createdAt: string;
    features: Record<string, Feature> | undefined;
}

export function generateEmptyPricing(): Pricing {
    return {
        saasName: "",
        syntaxVersion: "0.0",
        version: "",
        url: "",
        createdAt: new Date(),
        currency: "",
        billing: {
            "monthly": 1,
        },
        variables: {},
        tags: [],
        features: {},
        usageLimits: {},
        plans: {},
        addOns: {}
    }
}

export function generatePricingToBeWritten(): PricingToBeWritten {
    return {
        saasName: "",
        syntaxVersion: "0.0",
        version: "",
        url: "",
        createdAt: "",
        currency: "",
        billing: {
            "monthly": 1,
        },
        variables: {},
        tags: [],
        features: {},
        usageLimits: {},
        plans: {},
        addOns: {}
    }
}