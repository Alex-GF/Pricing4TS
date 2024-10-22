import { Feature } from './feature';
import { UsageLimit } from './usage-limit';

export interface Plan {
    name: string;
    description?: string;
    price: number | string;
    unit: string;
    features: { [key: string]: Feature };
    usageLimits?: { [key: string]: UsageLimit };
}