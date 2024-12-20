import { calculateOverriddenRow } from '../../../server/utils/dzn-exporter/number-utils';
import { Feature } from './feature';
import { UsageLimit } from './usage-limit';

export interface Plan {
  name: string;
  description?: string;
  price: number | string;
  unit: string;
  private: boolean;
  features: { [key: string]: Feature };
  usageLimits?: { [key: string]: UsageLimit };
}

export interface ContainerPlans{
  [key: string]: Plan;
}

export function getPlanNames(plans?: Plan[]): string[] {
  if (!plans) {
    return [];
  }

  return plans.map(plan => plan.name);
}

export function getPlanPrices(plans?: Plan[]): number[] {
  const prices: number[] = [];
  if (!plans) {
    return prices;
  }

  for (let i = 0; i < plans.length; i++) {
    const price = plans[i].price;
    if (typeof price === 'number') {
      prices.push(price);
    } else if (typeof price === 'string') {
      prices.push(10 * prices[i - 1]);
    }
  }

  return prices;
}

export function calculatePlanFeaturesMatrix(plans: Plan[]): number[][] {
  const matrix = [];
  for (let i = 0; i < plans.length; i++) {
    const features = Object.values(plans[i].features);
    const row: number[] = calculateOverriddenRow(features);
    matrix.push(row);
  }
  return matrix;
}

export function calculatePlanUsageLimitsMatrix(
  usageLimits: UsageLimit[],
  plans: Plan[]
): number[][] {
  const matrix: number[][] = [];

  if (usageLimits.length === 0) {
    return matrix;
  }

  for (let i = 0; i < plans.length; i++) {
    const usageLimits = plans[i].usageLimits;
    if (!usageLimits) {
      continue;
    }
    const row: number[] = calculateOverriddenRow(Object.values(usageLimits));
    matrix.push(row);
  }
  return matrix;
}
