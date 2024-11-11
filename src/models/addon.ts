import { valueToNumber } from '../utils/dzn-exporter/number-utils';
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

  for (let i = 0; i < addOns.length; i++) {
    const price = addOns[i].price;
    if (typeof price === 'number') {
      prices.push(price);
    } else if (i === addOns.length - 1 && typeof price === 'string') {
      prices.push(10 * (addOns[i - 1].price as number));
    }
  }

  return prices;
}

export function calculateAddOnsFeaturesMatrix(features: Feature[], addOns: AddOn[]): number[][] {
  const matrix = [];
  for (let i = 0; i < addOns.length; i++) {
    const addOnFeatures = addOns[i].features;
    if (!addOnFeatures) {
      matrix.push(new Array(features.length).fill(0));
      continue;
    }
    const row = [];
    for (let j = 0; j < features.length; j++) {
      let value = 0;
      const overriddenValue = addOnFeatures[features[j].name];
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
  for (let i = 0; i < addOns.length; i++) {
    const addOnUsageLimits = addOns[i].usageLimits || {};
    const numberOfOverriddenAddOns = Object.keys(addOnUsageLimits).length;
    if (numberOfOverriddenAddOns === 0) {
      matrix.push(new Array(usageLimits.length).fill(0));
      continue;
    }
    const row = [];
    for (let j = 0; j < usageLimits.length; j++) {
      const value = addOnUsageLimits[usageLimits[j].name]
        ? valueToNumber(addOnUsageLimits[usageLimits[j].name].value)
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
  for (let i = 0; i < addOns.length; i++) {
    const addOnUsageLimits = addOns[i].usageLimitsExtensions || {};
    const numberOfOverriddenAddOns = Object.keys(addOnUsageLimits).length;
    if (numberOfOverriddenAddOns === 0) {
      matrix.push(new Array(usageLimits.length).fill(0));
      continue;
    }
    const row = [];
    for (let j = 0; j < usageLimits.length; j++) {
      const value = addOnUsageLimits[usageLimits[j].name]
        ? valueToNumber(addOnUsageLimits[usageLimits[j].name].value)
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

  for (let i = 0; i < addOns.length; i++) {
    const row = [];
    for (let j = 0; j < planNames.length; j++) {
      const value = addOns[i].availableFor.includes(planNames[j]) ? 1 : 0;
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

  for (let i = 0; i < addOns.length; i++) {
    const dependsOn = addOns[i].dependsOn;
    const row = [];
    if (!dependsOn) {
      row.push(new Array(addOns.length).fill(0));
      continue;
    }
    for (let j = 0; j < addOns.length; j++) {
      const value = dependsOn.includes(addOns[j].name) ? 1 : 0;
      row.push(value);
    }
    matrix.push(row);
  }
  return matrix;
}
