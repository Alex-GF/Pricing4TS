import { Feature } from './feature.d.ts';
import { UsageLimit } from './usage-limit.d.ts';

export interface Plan {
    name: string;
    description: string;
    monthlyPrice: number;
    annualPrice: number;
    unit: string;
    features: Feature[];
    usageLimits?: UsageLimit[];
}