import { Feature } from './feature.ts';
import { UsageLimit } from './usage-limit.ts';

export interface Plan {
    name: string;
    description: string;
    monthlyPrice: number;
    annualPrice: number;
    unit: string;
    features: Feature[];
    usageLimits?: UsageLimit[];
}