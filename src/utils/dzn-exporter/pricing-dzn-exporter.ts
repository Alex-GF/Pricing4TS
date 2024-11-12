import { Pricing } from '../../main';
import { DZNKeywords, Chunk } from '.';
import { EOL } from 'os';
import {
  AddOn,
  calculateAddOnAvailableForMatrix,
  calculateAddOnsDependsOnMatrix,
  calculateAddOnsFeaturesMatrix,
  calculateAddOnsUsageLimitsExtensionsMatrix,
  calculateAddOnsUsageLimitsMatrix,
  getAddOnNames,
  getAddOnPrices,
} from '../../models/addon';
import {
  calculatePlanFeaturesMatrix,
  calculatePlanUsageLimitsMatrix,
  getAPlanPrices,
  getPlanNames,
  Plan,
} from '../../models/plan';
import { getFeatureNames, getNumberOfFeatures } from '../../models/feature';
import {
  calculateLinkedFeaturesMatrix,
  getNumberOfUsageLimits,
  getUsageLimitNames,
  UsageLimit,
} from '../../models/usage-limit';
import { formatMatrixToString, generateChunk, generateChunkBlock } from './string-utils';

export function pricing2DZN(pricing: Pricing): string {
  const numFeatures = getNumberOfFeatures(pricing.features);
  const numUsageLimits = getNumberOfUsageLimits(pricing.usageLimits);
  const numPlans = pricing.plans.length;
  const numAddOns = pricing.addOns ? pricing.addOns.length : 0;

  const variableChunks: Chunk[] = [
    {
      left: DZNKeywords.NumberOfFeatures,
      value: JSON.stringify(numFeatures),
    },
    {
      left: DZNKeywords.NumberOfUsageLimits,
      value: JSON.stringify(numUsageLimits),
    },
    { left: DZNKeywords.NumberOfPlans, value: JSON.stringify(numPlans) },
    { left: DZNKeywords.NumberOfAddOns, value: JSON.stringify(numAddOns) },
  ];

  const variablesBlock = generateChunkBlock(variableChunks);

  const featureNames = getFeatureNames(pricing.features);
  const usageLimitNames = getUsageLimitNames(pricing.usageLimits);
  const planNames = getPlanNames(pricing.plans);
  const addOnNames = getAddOnNames(pricing.addOns);

  const namesChunks: Chunk[] = [
    { left: DZNKeywords.Features, value: JSON.stringify(featureNames) },
    {
      left: DZNKeywords.UsageLimits,
      value: JSON.stringify(usageLimitNames),
    },
    { left: DZNKeywords.Plans, value: JSON.stringify(planNames) },
    { left: DZNKeywords.AddOns, value: JSON.stringify(addOnNames) },
  ];

  const namesBlock = generateChunkBlock(namesChunks);

  const pricesChunk = generatePricesChunk(pricing.plans, pricing.addOns);
  const planChunks = generatePlanChunks(pricing.usageLimits || [], pricing.plans);

  const linkedFeatures = generateLinkedFeaturesMatrix(pricing);
  const addOnsChunks = generateAddOnsChunks(pricing);
  return [variablesBlock, namesBlock, pricesChunk, linkedFeatures, planChunks, addOnsChunks].join(
    EOL
  );
}

function generatePricesChunk(plans: Plan[], addOns?: AddOn[]) {
  const plansPrices = getAPlanPrices(plans);
  const addOnPrices = getAddOnPrices(addOns);

  const pricesChunks: Chunk[] = [
    {
      left: DZNKeywords.PlansPrices,
      value: JSON.stringify(plansPrices),
    },
    {
      left: DZNKeywords.AddOnsPrices,
      value: JSON.stringify(addOnPrices),
    },
  ];

  return generateChunkBlock(pricesChunks);
}

function generatePlanChunks(usageLimits: UsageLimit[], plans: Plan[]): string {
  const planNames = plans.map(plan => plan.name);
  const planFeaturesMatrix = calculatePlanFeaturesMatrix(plans);
  const planUsageLimitsMatrix = calculatePlanUsageLimitsMatrix(usageLimits, plans);

  const addOnChunks: Chunk[] = [
    {
      left: DZNKeywords.PlansFeatures,
      row: DZNKeywords.Plans,
      col: DZNKeywords.Features,
      value: formatMatrixToString(planNames, planFeaturesMatrix),
    },
    {
      left: DZNKeywords.PlansUsageLimits,
      row: DZNKeywords.Plans,
      col: DZNKeywords.UsageLimits,
      value: formatMatrixToString(planNames, planUsageLimitsMatrix),
    },
  ];

  return generateChunkBlock(addOnChunks);
}

function generateAddOnsChunks(pricing: Pricing): string {
  if (!pricing.addOns) {
    return '';
  }

  if (!pricing.usageLimits) {
    return '';
  }

  const addOnNames = getAddOnNames(pricing.addOns);
  const planNames = getPlanNames(pricing.plans);

  const addOnsFeatureMatrix = calculateAddOnsFeaturesMatrix(pricing.features, pricing.addOns);
  const addOnsUsageLimitsMatrix = calculateAddOnsUsageLimitsMatrix(
    pricing.usageLimits,
    pricing.addOns
  );
  const addOnsUsageLimitsExtensionsMatrix = calculateAddOnsUsageLimitsExtensionsMatrix(
    pricing.usageLimits,
    pricing.addOns
  );
  const addOnsAvailableForMatrix = calculateAddOnAvailableForMatrix(planNames, pricing.addOns);
  const addOnsDependsOnMatrix = calculateAddOnsDependsOnMatrix(addOnNames, pricing.addOns);

  const addOnChunks: Chunk[] = [
    {
      left: DZNKeywords.AddOnsFeatures,
      row: DZNKeywords.AddOns,
      col: DZNKeywords.Features,
      value: formatMatrixToString(addOnNames, addOnsFeatureMatrix),
    },
    {
      left: DZNKeywords.AddOnsUsageLimits,
      row: DZNKeywords.AddOns,
      col: DZNKeywords.UsageLimits,
      value: formatMatrixToString(addOnNames, addOnsUsageLimitsMatrix),
    },
    {
      left: DZNKeywords.AddOnsUsageLimitsExtensions,
      row: DZNKeywords.AddOns,
      col: DZNKeywords.UsageLimits,
      value: formatMatrixToString(addOnNames, addOnsUsageLimitsExtensionsMatrix),
    },
    {
      left: DZNKeywords.AddOnsAvailableFor,
      row: DZNKeywords.AddOns,
      col: DZNKeywords.Plans,
      value: formatMatrixToString(addOnNames, addOnsAvailableForMatrix),
    },
    {
      left: DZNKeywords.AddOnsDependsOn,
      row: DZNKeywords.AddOns,
      col: DZNKeywords.AddOns,
      value: formatMatrixToString(addOnNames, addOnsDependsOnMatrix),
    },
  ];

  return generateChunkBlock(addOnChunks);
}

function generateLinkedFeaturesMatrix(pricing: Pricing): string {
  if (!pricing.usageLimits) {
    return '';
  }
  const usageLimitsNames = getUsageLimitNames(pricing.usageLimits);
  const featureNames = getFeatureNames(pricing.features);
  const linkedFeaturesMatrix = calculateLinkedFeaturesMatrix(pricing.usageLimits, featureNames);

  return generateChunk({
    left: DZNKeywords.LinkedFeatures,
    row: DZNKeywords.UsageLimits,
    col: DZNKeywords.Features,
    value: formatMatrixToString(usageLimitsNames, linkedFeaturesMatrix),
  });
}