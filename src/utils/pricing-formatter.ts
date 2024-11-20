import type { AddOn } from '../models/pricing2yaml/addon';
import type { Feature } from '../models/pricing2yaml/feature';
import type { Plan } from '../models/pricing2yaml/plan';
import { ExtractedPricing, generateEmptyPricing, Pricing } from '../models/pricing2yaml/pricing';
import type { UsageLimit } from '../models/pricing2yaml/usage-limit';
import {
  postValidateDependsOn,
  validateAddonFeatures,
  validateAddonUsageLimits,
  validateAddonUsageLimitsExtensions,
  validateAvailableFor,
  validateCreatedAt,
  validateCurrency,
  validateDefaultValue,
  validateDependsOn,
  validateDescription,
  validateExpression,
  validateFeature,
  validateFeatures,
  validateFeatureType,
  validateHasAnnualPayment,
  validateLinkedFeatures,
  validateName,
  validatePlan,
  validatePlanFeatures,
  validatePlans,
  validatePlanUsageLimits,
  validatePrice,
  validateRenderMode,
  validateTags,
  validateUnit,
  validateUsageLimit,
  validateUsageLimits,
  validateUsageLimitType,
  validateValue,
  validateValueType,
  validateVersion,
} from './pricing-validators';

export interface ContainerFeatures {
  [key: string]: Feature;
}

export interface ContainerUsageLimits {
  [key: string]: UsageLimit;
}

export interface ContainerPlans {
  [key: string]: Plan;
}

export interface ContainerAddOns {
  [key: string]: AddOn;
}

export function formatPricing(extractedPricing: ExtractedPricing): Pricing {
  const pricing: Pricing = generateEmptyPricing();

  formatBasicAttributes(extractedPricing, pricing);

  // Validate and format tags if provided
  if (extractedPricing.tags !== null && extractedPricing.tags !== undefined) {
    pricing.tags = validateTags(extractedPricing.tags);
  }

  // Format and parse features
  validateFeatures(extractedPricing.features);
  const formattedFeatures = formatObjectToArray(extractedPricing.features) as Feature[];
  pricing.features = formattedFeatures.map(f => formatFeature(f, pricing.tags));

  // Format and parse usage limits, considering they can be null/undefined
  if (extractedPricing.usageLimits == null || extractedPricing.usageLimits == undefined) {
    pricing.usageLimits = [];
  } else {
    validateUsageLimits(extractedPricing.usageLimits);
    const formattedUsageLimits = formatObjectToArray(extractedPricing.usageLimits) as UsageLimit[];
    pricing.usageLimits = formattedUsageLimits.map(u => formatUsageLimit(u, pricing));
  }

  // Format and parse plans, considering they can be null/undefined
  if (extractedPricing.plans == null || extractedPricing.plans == undefined) {
    pricing.plans = [];
  } else {
    validatePlans(extractedPricing.plans)
    const formattedPlans = formatObjectToArray(extractedPricing.plans) as Plan[];
    pricing.plans = formattedPlans.map(p => formatPlan(p, pricing));
  }

  // Format and parse add-ons, considering they can be null/undefined
  if (extractedPricing.addOns == null || extractedPricing.addOns == undefined) {
    pricing.addOns = [];
  } else {
    const formattedAddOns = formatObjectToArray(extractedPricing.addOns) as AddOn[];
    pricing.addOns = formattedAddOns.map(a => formatAddOn(a, pricing));
    pricing.addOns.forEach(a => postValidateDependsOn(a.dependsOn, pricing));
  }

  if (!pricing.plans && !pricing.addOns) {
    throw new Error('At least one of the following must be provided: plans, addOns');
  }

  return pricing;
}

// --------- PRICING ELEMENTS FORMATTERS ---------

function formatBasicAttributes(extractedPricing: ExtractedPricing, pricing: Pricing): void {
  pricing.version = validateVersion(extractedPricing.version); // Assumes that the version has been processed to be the last one
  pricing.saasName = validateName(extractedPricing.saasName, 'SaaS');
  pricing.createdAt = validateCreatedAt(extractedPricing.createdAt);
  pricing.currency = validateCurrency(extractedPricing.currency);
  pricing.hasAnnualPayment = validateHasAnnualPayment(extractedPricing.hasAnnualPayment);
}

function formatFeature(feature: Feature, tags?: string[]): Feature {
  const featureName = feature.name;

  try {  
    validateFeature(feature);
    feature.name = validateName(feature.name, 'Feature');
    feature.description = validateDescription(feature.description);
    feature.valueType = validateValueType(feature.valueType);
    feature.defaultValue = validateDefaultValue(feature, 'feature');
    feature.value = validateValue(feature, 'feature');
    feature.expression = validateExpression(feature.expression, 'expression');
    feature.serverExpression = validateExpression(feature.serverExpression, 'serverExpression');
    feature.type = validateFeatureType(feature.type);
    feature.render = validateRenderMode(feature.render);
    feature.tag = validateTag(feature.tag, tags);
  } catch (err) {
    throw new Error(`Error parsing feature ${featureName}. Error: ${(err as Error).message}`);
  }

  return feature;
}

function formatUsageLimit(usageLimit: UsageLimit, pricing: Pricing): UsageLimit {
  try {
    validateUsageLimit(usageLimit);
    usageLimit.name = validateName(usageLimit.name, 'Usage Limit');
    usageLimit.description = validateDescription(usageLimit.description);
    usageLimit.valueType = validateValueType(usageLimit.valueType);
    usageLimit.defaultValue = validateDefaultValue(usageLimit, 'usage limit') as
      | string
      | number
      | boolean;
    usageLimit.value = validateValue(usageLimit, 'usage limit') as
      | string
      | number
      | boolean
      | undefined;
    usageLimit.unit = validateUnit(usageLimit.unit);
    usageLimit.type = validateUsageLimitType(usageLimit.type);
    usageLimit.linkedFeatures = validateLinkedFeatures(usageLimit.linkedFeatures, pricing);
    usageLimit.render = validateRenderMode(usageLimit.render);
  } catch (err) {
    throw new Error(
      `Error parsing usage limit ${usageLimit.name}. Error: ${(err as Error).message}`
    );
  }

  return usageLimit;
}

function formatPlan(plan: Plan, pricing: Pricing): Plan {
  try {
    validatePlan(plan);
    plan.name = validateName(plan.name, 'Plan');
    plan.description = validateDescription(plan.description);
    plan.price = validatePrice(plan.price);
    plan.unit = validateUnit(plan.unit);

    const planFeatures: ContainerFeatures = formatArrayIntoObject(
      pricing.features
    ) as ContainerFeatures;

    if (plan.features !== null && plan.features !== undefined) {
      plan.features = formatObject(plan.features ?? {}) as ContainerFeatures;
    } else {
      plan.features = {};
    }

    plan.features = validatePlanFeatures(plan, planFeatures);

    const planUsageLimits: ContainerUsageLimits = formatArrayIntoObject(
      pricing.usageLimits!
    ) as ContainerUsageLimits;

    if (plan.usageLimits !== null && plan.usageLimits !== undefined) {
      plan.usageLimits = formatObject(plan.usageLimits) as ContainerUsageLimits;
    } else {
      plan.usageLimits = {};
    }

    plan.usageLimits = validatePlanUsageLimits(plan, planUsageLimits);
  } catch (err) {
    throw new Error(`Error parsing plan ${plan.name}. Error: ${(err as Error).message}`);
  }

  return plan;
}

function formatAddOn(addon: AddOn, pricing: Pricing): AddOn {
  try {
    addon.name = validateName(addon.name, 'Addon');
    addon.description = validateDescription(addon.description);
    addon.availableFor = validateAvailableFor(addon.availableFor, pricing);
    addon.dependsOn = validateDependsOn(addon.dependsOn, pricing);
    addon.price = validatePrice(addon.price);
    addon.unit = validateUnit(addon.unit);

    // Parse Features if provided
    if (addon.features !== null && addon.features !== undefined) {
      const addonFeatures: ContainerFeatures = formatArrayIntoObject(
        pricing.features
      ) as ContainerFeatures;

      addon.features = formatObject(addon.features) as ContainerFeatures;
      addon.features = validateAddonFeatures(addon, addonFeatures);
    } else {
      addon.features = {};
    }

    // Parse UsageLimits if provided
    if (addon.usageLimits !== null && addon.usageLimits !== undefined) {
      const addonUsageLimits: ContainerUsageLimits = formatArrayIntoObject(
        pricing.usageLimits!
      ) as ContainerUsageLimits;

      addon.usageLimits = formatObject(addon.usageLimits) as ContainerUsageLimits;
      addon.usageLimits = validateAddonUsageLimits(addon, addonUsageLimits);
    } else {
      addon.usageLimits = {};
    }

    // Parse usageLimitsExtensions if provided
    if (addon.usageLimitsExtensions !== null && addon.usageLimitsExtensions !== undefined) {
      const addonUsageLimitsExtensions: ContainerUsageLimits = formatArrayIntoObject(
        pricing.usageLimits!
      ) as ContainerUsageLimits;

      addon.usageLimitsExtensions = formatObject(
        addon.usageLimitsExtensions
      ) as ContainerUsageLimits;
      addon.usageLimitsExtensions = validateAddonUsageLimitsExtensions(addon, addonUsageLimitsExtensions);
    } else {
      addon.usageLimitsExtensions = {};
    }
  } catch (err) {
    throw new Error(`Error parsing addon ${addon.name}. Error: ${(err as Error).message}`);
  }

  return addon;
}

function validateTag(tag: string | undefined, tags: string[] | undefined): string | undefined {
  try {
    if (tag && tags && !tags.includes(tag)) {
      throw new Error(`Feature tag '${tag}' must be one of the values defined in 'tags'`);
    }
    return tag;
  } catch (err) {
    throw new Error(`Error validating tag: ${(err as Error).message}`);
  }
}

// --------- UTILITY FUNCTIONS ---------

export function formatObjectToArray<T>(object: object): T[] {
  return Object.entries(object).map(([name, details]) => ({
    name,
    ...details,
  }));
}

export function formatObject(object: object): ContainerFeatures | ContainerUsageLimits {
  return Object.entries(object).reduce(
    (acc: ContainerFeatures | ContainerUsageLimits, [key, value]) => {
      acc[key] = { name: key, ...value };
      return acc;
    },
    {} as ContainerFeatures | ContainerUsageLimits
  );
}

export function formatArrayIntoObject(
  array: Feature[] | UsageLimit[] | Plan[] | AddOn[]
): ContainerFeatures | ContainerUsageLimits | ContainerPlans | ContainerAddOns {
  return array.reduce((acc: ContainerFeatures | ContainerUsageLimits | ContainerPlans | ContainerAddOns, { name, ...rest }) => {
    acc[name] = { name, ...rest };
    return acc;
  }, {} as ContainerFeatures | ContainerUsageLimits);
}
