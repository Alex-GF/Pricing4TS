import { Feature } from './feature.d.ts';
import { UsageLimit } from './usage-limit.d.ts';
import { Plan } from './plan.d.ts';
import { AddOn } from './addon.d.ts';

export interface Pricing {
    name: string;
    createdAt: string;
    currency: string;
    hasAnnualPayment: boolean;
    features: Feature[];
    usageLimits?: UsageLimit[];
    plans: Plan[];
    addOns?: AddOn[];
}