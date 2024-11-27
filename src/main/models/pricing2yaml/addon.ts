import { valueToNumber } from '../../../server/utils/dzn-exporter/number-utils';
import { Feature } from './feature';
import { UsageLimit } from './usage-limit';

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

export interface ContainerAddOns {
  [key: string]: AddOn;
}

export function getAddOnNames(addOns?: AddOn[]): string[] {
  if (!addOns) {
    return [];
  }

  return addOns.map(addOn => addOn.name);
}

export function getAddOnPrices(addOns?: AddOn[]): number[] {
  const prices: number[] = [];
  if (!addOns) {
    return prices;
  }

  for (const addOn of addOns) {
    const price = addOn.price;
    if (typeof price === 'number') {
      prices.push(price);
    } else if (typeof price === 'string') {
      prices.push(100);
    }
  }

  return prices;
}

export function calculateAddOnsFeaturesMatrix(features: Feature[], addOns: AddOn[]): number[][] {
  const matrix = [];
  for (const addOn of addOns) {
    const addOnFeatures = addOn.features;
    if (!addOnFeatures) {
      matrix.push(new Array(features.length).fill(0));
      continue;
    }
    const row = [];
    for (const feature of features) {
      let value = 0;
      const overriddenValue = addOnFeatures[feature.name];
      if (overriddenValue) {
        value = 1;
      }
      row.push(value);
    }
  
    matrix.push(row);
  }
  return matrix;
}

export function calculateAddOnsUsageLimitsMatrix(
  usageLimits: UsageLimit[],
  addOns: AddOn[]
): number[][] {
  const matrix: number[][] = [];

  if (usageLimits.length === 0) {
    return matrix;
  }
  for (const addOn of addOns) {
    const addOnUsageLimits = addOn.usageLimits || {};
    const numberOfOverriddenAddOns = Object.keys(addOnUsageLimits).length;
    if (numberOfOverriddenAddOns === 0) {
      matrix.push(new Array(usageLimits.length).fill(0));
      continue;
    }
    const row = [];
    for (const usageLimit of usageLimits) {
      const value = addOnUsageLimits[usageLimit.name]
        ? valueToNumber(addOnUsageLimits[usageLimit.name].value)
        : 0;
      row.push(value);
    }

    matrix.push(row);
  }
  return matrix;
}

export function calculateAddOnsUsageLimitsExtensionsMatrix(
  usageLimits: UsageLimit[],
  addOns: AddOn[]
): number[][] {
  const matrix: number[][] = [];

  if (usageLimits.length === 0) {
    return matrix;
  }
  for (const addOn of addOns) {
    const addOnUsageLimits = addOn.usageLimitsExtensions || {};
    const numberOfOverriddenAddOns = Object.keys(addOnUsageLimits).length;
    if (numberOfOverriddenAddOns === 0) {
      matrix.push(new Array(usageLimits.length).fill(0));
      continue;
    }
    const row = [];
    for (const usageLimit of usageLimits) {
      const value = addOnUsageLimits[usageLimit.name]
        ? valueToNumber(addOnUsageLimits[usageLimit.name].value)
        : 0;
      row.push(value);
    }
  
    matrix.push(row);
  }
  return matrix;
}

export function calculateAddOnAvailableForMatrix(
  planNames: string[],
  addOns?: AddOn[]
): number[][] {
  const matrix: number[][] = [];

  if (!addOns || planNames.length === 0) {
    return matrix;
  }

  for (const addOn of addOns) {
    const row = [];
    for (const planName of planNames) {
      const value = addOn.availableFor.includes(planName) ? 1 : 0;
      row.push(value);
    }
    matrix.push(row);
  }
  return matrix;
}

export function calculateAddOnsDependsOnMatrix(addOnNames: string[], addOns?: AddOn[]) {
  const matrix: number[][] = [];

  if (!addOns) {
    return matrix;
  }

  for (const addOn of addOns) {
    const dependsOn = addOn.dependsOn;
    const row = [];
    if (!dependsOn) {
      row.push(new Array(addOns.length).fill(0));
      continue;
    }
    for (const innerAddOn of addOns) {
      const value = dependsOn.includes(innerAddOn.name) ? 1 : 0;
      row.push(value);
    }
    matrix.push(row);
  }
  return matrix;
}
