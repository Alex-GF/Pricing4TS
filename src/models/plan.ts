import { Feature } from './feature.ts';
import { UsageLimit } from './usage-limit.ts';

export interface Plan {
    name: string;
    description?: string;
    price: number | string;
    unit: string;
    features: { [key: string]: Feature };
    usageLimits?: { [key: string]: UsageLimit };
}