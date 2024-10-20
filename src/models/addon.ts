import { Feature } from './feature.ts';
import { UsageLimit } from './usage-limit.ts';

export interface AddOn {
  name: string;
  description?: string;
  price: number | string;
  availableFor: string[];
  dependsOn?: string[];
  unit: string;
  features?: { [key: string]: Feature };
  usageLimits?: { [key: string]: UsageLimit };
  usageLimitsExtensions?: { [key: string]: UsageLimit };
}