import { ValueType, UsageLimitType, RenderMode } from './types';

export interface UsageLimit {
  name: string;
  description?: string;
  valueType: ValueType;
  defaultValue: string | number | boolean;
  value?: string | number | boolean;
  unit: string;
  type: UsageLimitType;
  linkedFeatures?: string[];
  render: RenderMode;
}

export function getNumberOfUsageLimits(usageLimits?: UsageLimit[]): number {
  return usageLimits ? usageLimits.length : 0;
}

export function getUsageLimitNames(usageLimits?: UsageLimit[]): string[] {
  return usageLimits ? usageLimits.map(usageLimit => usageLimit.name) : [];
}

export function calculateLinkedFeaturesMatrix(
  usageLimits: UsageLimit[],
  featureNames: string[]
): number[][] {
  const matrix = [];

  for (let i = 0; i < usageLimits.length; i++) {
    const row: number[] = [];
    const linkedFeatures = usageLimits[i].linkedFeatures;

    if (!linkedFeatures) {
      matrix.push(new Array(featureNames.length).fill(0));
      continue;
    }

    for (let j = 0; j < featureNames.length; j++) {
      const isLinkedToFeature = linkedFeatures.includes(featureNames[j]) ? 1 : 0;
      row.push(isLinkedToFeature);
    }
    matrix.push(row);
  }
  return matrix;
}
