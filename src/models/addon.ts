import { Feature } from './feature.ts';
import { UsageLimit } from './usage-limit.ts';

export interface AddOn {
  name: string;
  price: number | string;
  availableFor: string[];
  dependsOn: string[] | null;
  unit: string;
  features?: Feature[] | null;
  usageLimits?: UsageLimit[] | null;
  usageLimitsExtensions?: UsageLimit[] | null;
}