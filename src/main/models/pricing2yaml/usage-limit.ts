import { ValueType, UsageLimitType, RenderMode } from './types';

export interface UsageLimit {
  name: string;
  description?: string;
  trackable?: boolean;
  period?: {
    unit: "SEC" | "MIN" | "HOUR" | "DAY" | "MONTH" | "YEAR";
    value: number;
  }
  valueType: ValueType;
  defaultValue: string | number | boolean;
  value?: string | number | boolean;
  unit: string;
  type: UsageLimitType;
  linkedFeatures?: string[];
  render: RenderMode;
}

export interface ContainerUsageLimits {
  [key: string]: UsageLimit;
}

export function getNumberOfUsageLimits(usageLimits?: Record<string, UsageLimit>): number {
  return usageLimits ? Object.keys(usageLimits).length : 0;
}

export function getUsageLimitNames(usageLimits?: Record<string, UsageLimit>): string[] {
  return usageLimits ? Object.values(usageLimits).map(usageLimit => usageLimit.name) : [];
}

export function calculateLinkedFeaturesMatrix(
  usageLimits: Record<string, UsageLimit>,
  featureNames: string[]
): number[][] {
  const matrix = [];

  for (let i = 0; i < Object.keys(usageLimits).length; i++) {
    const row: number[] = [];
    const usageLimit = usageLimits[Object.keys(usageLimits)[i]];
    const linkedFeatures = usageLimit.linkedFeatures;

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
