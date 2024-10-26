import { Feature } from './feature';
import { UsageLimit } from './usage-limit';
import { Plan } from './plan';
import { AddOn } from './addon';

export interface Pricing {
    saasName: string;
    version: string;
    createdAt: Date;
    currency: string;
    hasAnnualPayment: boolean;
    tags?: string[];
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
        tags: [],
        addOns: []
    }
}