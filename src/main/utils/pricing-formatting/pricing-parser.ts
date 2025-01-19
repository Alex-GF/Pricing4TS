import type { Feature, AddOn, Plan } from '../../../types';
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
  validateVariables,
  validateSyntaxVersion,
  validateVersion,
} from '../pricing-validators';

export function parsePricing(extractedPricing: ExtractedPricing): Pricing {
  const pricing: Pricing = generateEmptyPricing();

  parseBasicAttributes(extractedPricing, pricing);

  // Format and parse features
  validateFeatures(extractedPricing.features);
  let formattedFeatures = formatObjectToArray(extractedPricing.features) as Feature[];
  formattedFeatures = formattedFeatures.map(f => parseFeature(f, pricing.tags));
  pricing.features = formatArrayIntoObject(formattedFeatures) as Record<string, Feature>;

  // Format and parse usage limits, considering they can be null/undefined
  if (extractedPricing.usageLimits == null || extractedPricing.usageLimits == undefined) {
    pricing.usageLimits = {};
  } else {
    validateUsageLimits(extractedPricing.usageLimits);
    let formattedUsageLimits = formatObjectToArray(extractedPricing.usageLimits) as UsageLimit[];
    formattedUsageLimits = formattedUsageLimits.map(u => parseUsageLimit(u, pricing));
    pricing.usageLimits = formatArrayIntoObject(formattedUsageLimits) as Record<string, UsageLimit>;
  }

  // Format and parse plans, considering they can be null/undefined
  if (extractedPricing.plans == null || extractedPricing.plans == undefined) {
    pricing.plans = {};
  } else {
    validatePlans(extractedPricing.plans);
    const plansToFormat = formatObjectToArray(extractedPricing.plans) as Plan[];
    const formattedPlans: Plan[] = [];
    for (const plan of plansToFormat) {
    
      const formattedPlan = parsePlan(plan, pricing);
      formattedPlans.push(formattedPlan);
    }
    pricing.plans = formatArrayIntoObject(formattedPlans) as Record<string, Plan>;
  }

  // Format and parse add-ons, considering they can be null/undefined
  if (extractedPricing.addOns == null || extractedPricing.addOns == undefined) {
    pricing.addOns = {};
  } else {
    let formattedAddOns = formatObjectToArray(extractedPricing.addOns) as AddOn[];
    formattedAddOns = formattedAddOns.map(a => parseAddOn(a, pricing));
    pricing.addOns = formatArrayIntoObject(formattedAddOns) as Record<string, AddOn>;
    Object.values(pricing.addOns).forEach(a => postValidateDependsOnOrExclude(a.dependsOn, pricing));
    Object.values(pricing.addOns).forEach(a => postValidateDependsOnOrExclude(a.excludes, pricing));
  }

  if (!pricing.plans && !pricing.addOns) {
    throw new Error('At least one of the following must be provided: plans, addOns');
  }

  return pricing;
}

// --------- PRICING ELEMENTS FORMATTERS ---------

function parseBasicAttributes(extractedPricing: ExtractedPricing, pricing: Pricing): void {
  pricing.syntaxVersion = validateSyntaxVersion(extractedPricing.syntaxVersion); // Assumes that the version has been processed to be the last one
  pricing.saasName = validateName(extractedPricing.saasName, 'SaaS');
  pricing.url = validateUrl(extractedPricing.url);
  pricing.createdAt = validateCreatedAt(extractedPricing.createdAt);
  pricing.version = validateVersion(extractedPricing.version, pricing.createdAt); // Assumes that the version has been processed to be the last one
  pricing.currency = validateCurrency(extractedPricing.currency);
  pricing.billing = validateBilling(extractedPricing.billing);
  pricing.variables = validateVariables(extractedPricing.variables);
  pricing.tags = validateTags(extractedPricing.tags);
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
    plan.price = validatePrice(plan.price, pricing.variables);
    plan.unit = validateUnit(plan.unit);
    plan.private = validatePrivate(plan.private);

    const planFeatures: Record<string, Feature> = JSON.parse(JSON.stringify(pricing.features)); // This is performed in order to avoid modifying the original object

    if (plan.features !== null && plan.features !== undefined) {
      plan.features = formatObject(plan.features ?? {}) as Record<string, Feature>;
    } else {
      plan.features = {};
    }

    plan.features = validatePlanFeatures(plan, planFeatures);

    const planUsageLimits: Record<string, UsageLimit> = JSON.parse(JSON.stringify(pricing.usageLimits!));

    if (plan.usageLimits !== null && plan.usageLimits !== undefined) {
      plan.usageLimits = formatObject(plan.usageLimits) as Record<string, UsageLimit>;
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
    addon.price = validatePrice(addon.price, pricing.variables);
    addon.unit = validateUnit(addon.unit);
    addon.private = validatePrivate(addon.private);

    // Parse Features if provided
    if (addon.features !== null && addon.features !== undefined) {
      const addonFeatures: Record<string, Feature> = JSON.parse(JSON.stringify(pricing.features));

      addon.features = formatObject(addon.features) as Record<string, Feature>;
      addon.features = validateAddonFeatures(addon, addonFeatures);
    } else {
      addon.features = {};
    }

    // Parse UsageLimits if provided
    if (addon.usageLimits !== null && addon.usageLimits !== undefined) {
      const addonUsageLimits: Record<string, UsageLimit> = JSON.parse(JSON.stringify(pricing.usageLimits!));

      addon.usageLimits = formatObject(addon.usageLimits) as Record<string, UsageLimit>;
      addon.usageLimits = validateAddonUsageLimits(addon, addonUsageLimits);
    } else {
      addon.usageLimits = {};
    }

    // Parse usageLimitsExtensions if provided
    if (addon.usageLimitsExtensions !== null && addon.usageLimitsExtensions !== undefined) {
      const addonUsageLimitsExtensions: Record<string, UsageLimit> = JSON.parse(JSON.stringify(pricing.usageLimits!));

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

    if (Object.keys(addon.features).length === 0 && Object.keys(addon.usageLimits).length === 0 && Object.keys(addon.usageLimitsExtensions).length === 0) {
      throw new Error('An add-on cannot be empty. It must have at least one feature, usage limit or usage limit extension');
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

export function formatObject(object: object): Record<string, Feature> | Record<string, UsageLimit> {
  return Object.entries(object).reduce(
    (acc: Record<string, Feature> | Record<string, UsageLimit>, [key, value]) => {
      acc[key] = { name: key, ...value };
      return acc;
    },
    {} as Record<string, Feature> | Record<string, UsageLimit>
  );
}

export function formatArrayIntoObject(
  array: Feature[] | UsageLimit[] | Plan[] | AddOn[]
): Record<string, Feature | UsageLimit | Plan | AddOn> {
  return array.reduce((acc: Record<string, Feature | UsageLimit | Plan | AddOn>, { name, ...rest }) => {
    acc[name] = { name, ...rest };
    return acc;
  }, {} as Record<string, Feature | UsageLimit | Plan | AddOn>);
}
