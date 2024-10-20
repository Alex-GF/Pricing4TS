import { Feature } from './feature.ts';
import { UsageLimit } from './usage-limit.ts';
import { Plan } from './plan.ts';
import { AddOn } from './addon.ts';

export interface Pricing {
    saasName: string;
    version: string;
    createdAt: Date;
    currency: string;
    hasAnnualPayment: boolean;
    features: Feature[];
    usageLimits?: UsageLimit[];
    plans: Plan[];
    addOns?: AddOn[];
}

export interface ExtractedPricing extends Omit<Pricing, 'version' | 'createdAt'> {
    version: string;
    createdAt: string | Date;
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
        addOns: []
    }
}