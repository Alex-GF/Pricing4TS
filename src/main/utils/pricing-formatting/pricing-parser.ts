import type { AddOn } from '../../models/pricing2yaml/addon';
import type { ContainerFeatures, Feature } from '../../models/pricing2yaml/feature';
import type { Plan } from '../../models/pricing2yaml/plan';
import { ExtractedPricing, generateEmptyPricing, Pricing } from '../../models/pricing2yaml/pricing';
import type { ContainerUsageLimits, UsageLimit } from '../../models/pricing2yaml/usage-limit';
import {
  postValidateDependsOnOrExclude,
  validateAddonFeatures,
  validateAddonUsageLimits,
  validateAddonUsageLimitsExtensions,
  validateAvailableFor,
  validateBilling,
  validateCreatedAt,
  validateCurrency,
  validateDefaultValue,
  validateDependsOnOrExcludes,
  validateDescription,
  validateExpression,
  validateFeature,
  validateFeatureAutomationType,
  validateFeatureIntegrationType,
  validateFeatures,
  validateFeatureType,
  validateLinkedFeatures,
  validateName,
  validatePlan,
  validatePlanFeatures,
  validatePlans,
  validatePlanUsageLimits,
  validatePrice,
  validatePrivate,
  validateRenderMode,
  validateTags,
  validateUnit,
  validateUrl,
  validateUsageLimit,
  validateUsageLimits,
  validateUsageLimitType,
  validateValue,
  validateValueType,
  validateVersion,
} from '../pricing-validators';

export function parsePricing(extractedPricing: ExtractedPricing): Pricing {
  const pricing: Pricing = generateEmptyPricing();

  parseBasicAttributes(extractedPricing, pricing);

  // Validate and format tags if provided
  if (extractedPricing.tags !== null && extractedPricing.tags !== undefined) {
    pricing.tags = validateTags(extractedPricing.tags);
  }

  // Format and parse features
  validateFeatures(extractedPricing.features);
  const formattedFeatures = formatObjectToArray(extractedPricing.features) as Feature[];
  pricing.features = formattedFeatures.map(f => parseFeature(f, pricing.tags));

  // Format and parse usage limits, considering they can be null/undefined
  if (extractedPricing.usageLimits == null || extractedPricing.usageLimits == undefined) {
    pricing.usageLimits = [];
  } else {
    validateUsageLimits(extractedPricing.usageLimits);
    const formattedUsageLimits = formatObjectToArray(extractedPricing.usageLimits) as UsageLimit[];
    pricing.usageLimits = formattedUsageLimits.map(u => parseUsageLimit(u, pricing));
  }

  // Format and parse plans, considering they can be null/undefined
  if (extractedPricing.plans == null || extractedPricing.plans == undefined) {
    pricing.plans = [];
  } else {
    validatePlans(extractedPricing.plans);
    const formattedPlans = formatObjectToArray(extractedPricing.plans) as Plan[];
    pricing.plans = formattedPlans.map(p => parsePlan(p, pricing));
  }

  // Format and parse add-ons, considering they can be null/undefined
  if (extractedPricing.addOns == null || extractedPricing.addOns == undefined) {
    pricing.addOns = [];
  } else {
    const formattedAddOns = formatObjectToArray(extractedPricing.addOns) as AddOn[];
    pricing.addOns = formattedAddOns.map(a => parseAddOn(a, pricing));
    pricing.addOns.forEach(a => postValidateDependsOnOrExclude(a.dependsOn, pricing));
    pricing.addOns.forEach(a => postValidateDependsOnOrExclude(a.excludes, pricing));
  }

  if (!pricing.plans && !pricing.addOns) {
    throw new Error('At least one of the following must be provided: plans, addOns');
  }

  return pricing;
}

// --------- PRICING ELEMENTS FORMATTERS ---------

function parseBasicAttributes(extractedPricing: ExtractedPricing, pricing: Pricing): void {
  pricing.version = validateVersion(extractedPricing.version); // Assumes that the version has been processed to be the last one
  pricing.saasName = validateName(extractedPricing.saasName, 'SaaS');
  pricing.url = validateUrl(extractedPricing.url);
  pricing.createdAt = validateCreatedAt(extractedPricing.createdAt);
  pricing.currency = validateCurrency(extractedPricing.currency);
  pricing.billing = validateBilling(extractedPricing.billing);
}

function parseFeature(feature: Feature, tags?: string[]): Feature {
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
    feature.integrationType = validateFeatureIntegrationType(feature.integrationType);
    feature.automationType = validateFeatureAutomationType(feature.automationType);
    feature.render = validateRenderMode(feature.render);
    feature.tag = validateTag(feature.tag, tags);
  } catch (err) {
    throw new Error(`Error parsing feature ${featureName}. Error: ${(err as Error).message}`);
  }

  return feature;
}

function parseUsageLimit(usageLimit: UsageLimit, pricing: Pricing): UsageLimit {
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

function parsePlan(plan: Plan, pricing: Pricing): Plan {
  try {
    validatePlan(plan);
    plan.name = validateName(plan.name, 'Plan');
    plan.description = validateDescription(plan.description);
    plan.price = validatePrice(plan.price);
    plan.unit = validateUnit(plan.unit);
    plan.private = validatePrivate(plan.private);

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

function parseAddOn(addon: AddOn, pricing: Pricing): AddOn {
  try {
    addon.name = validateName(addon.name, 'Addon');
    addon.description = validateDescription(addon.description);
    addon.availableFor = validateAvailableFor(addon.availableFor, pricing);
    addon.dependsOn = validateDependsOnOrExcludes(addon.dependsOn, pricing, "dependsOn");
    addon.excludes = validateDependsOnOrExcludes(addon.excludes, pricing, "excludes");
    addon.price = validatePrice(addon.price);
    addon.unit = validateUnit(addon.unit);
    addon.private = validatePrivate(addon.private);

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
      addon.usageLimitsExtensions = validateAddonUsageLimitsExtensions(
        addon,
        addonUsageLimitsExtensions
      );
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
  array: Feature[] | UsageLimit[]
): ContainerFeatures | ContainerUsageLimits {
  return array.reduce((acc: ContainerFeatures | ContainerUsageLimits, { name, ...rest }) => {
    acc[name] = { name, ...rest };
    return acc;
  }, {} as ContainerFeatures | ContainerUsageLimits);
}
