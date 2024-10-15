import { Feature } from './feature.d.ts';
import { UsageLimit } from './usage-limit.d.ts';

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