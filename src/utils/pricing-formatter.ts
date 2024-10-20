import type { AddOn } from "../models/addon.ts";
import type { Feature } from "../models/feature.ts";
import type { Plan } from "../models/plan.ts";
import {
  Pricing,
  ExtractedPricing,
  generateEmptyPricing,
} from "../models/pricing.ts";
import type { UsageLimit } from "../models/usage-limit.ts";
import {
  validateName,
  validateVersion,
  validateCreatedAt,
  validateCurrency,
  validateHasAnnualPayment,
  validateDescription,
  validateValueType,
  validateDefaultValue,
  validateExpression,
  validateValue,
  validateFeatureType
} from "./pricing-validators.ts";

export function formatPricing(extractedPricing: ExtractedPricing): Pricing {
  const pricing: Pricing = generateEmptyPricing();

  formatBasicAttributes(extractedPricing, pricing);

  // Format and parse features
  const formattedFeatures = formatObjectToArray(
    extractedPricing.features
  ) as Feature[];
  pricing.features = formattedFeatures.map((f) => formatFeature(f));

  // Format and parse usage limits, considering they can be null/undefined
  if (
    extractedPricing.usageLimits == null ||
    extractedPricing.usageLimits == undefined
  ) {
    pricing.usageLimits = [];
  } else {
    const formattedUsageLimits = formatObjectToArray(
      extractedPricing.usageLimits
    ) as UsageLimit[];
    pricing.usageLimits = formattedUsageLimits.map((u) =>
      formatUsageLimit(u, pricing)
    );
  }

  // Format and parse plans, considering they can be null/undefined
  if (extractedPricing.plans == null || extractedPricing.plans == undefined) {
    pricing.plans = [];
  } else {
    const formattedPlans = formatObjectToArray(
      extractedPricing.plans
    ) as Plan[];
    pricing.plans = formattedPlans.map((p) => formatPlan(p, pricing));
  }

  // Format and parse add-ons, considering they can be null/undefined
  if (extractedPricing.addOns == null || extractedPricing.addOns == undefined) {
    pricing.addOns = [];
  } else {
    const formattedAddOns = formatObjectToArray(
      extractedPricing.addOns
    ) as AddOn[];
    pricing.addOns = formattedAddOns.map((a) => formatAddOn(a, pricing));
  }

  return pricing;
}

// --------- PRICING ELEMENTS FORMATTERS ---------

function formatBasicAttributes(
  extractedPricing: ExtractedPricing,
  pricing: Pricing
): void {
  pricing.version = validateVersion(extractedPricing.version); // Assumes that the version has been processed to be the last one
  pricing.saasName = validateName(extractedPricing.saasName, "SaaS");
  pricing.createdAt = validateCreatedAt(extractedPricing.createdAt);
  pricing.currency = validateCurrency(extractedPricing.currency);
  pricing.hasAnnualPayment = validateHasAnnualPayment(
    extractedPricing.hasAnnualPayment
  );
}

function formatFeature(feature: Feature): Feature {
  const featureName = feature.name;

  try {
    feature.name = validateName(feature.name, "Feature");
    feature.description = validateDescription(feature.description);
    feature.valueType = validateValueType(feature.valueType);
    feature.defaultValue = validateDefaultValue(feature, "feature");
    feature.value = validateValue(feature, "feature");
    feature.expression = validateExpression(feature.expression, "expression");
    feature.serverExpression = validateExpression(feature.serverExpression, "serverExpression");
    feature.type = validateFeatureType(feature.type);
  } catch (err) {
    throw new Error(
      `Error parsing feature ${featureName}. Error: ${(err as Error).message}`
    );
  }

  return feature;
}

function formatUsageLimit(
  usageLimit: UsageLimit,
  pricing: Pricing
): UsageLimit {
  // Implement usage limit formatting logic here
  return usageLimit;
}

function formatPlan(plan: Plan, pricing: Pricing): Plan {
  // Implement plan formatting logic here
  return plan;
}

function formatAddOn(addon: AddOn, pricing: Pricing): AddOn {
  // Implement add-on formatting logic here
  return addon;
}

// --------- UTILITY FUNCTIONS ---------

function formatObjectToArray<T>(object: object): T[] {
  return Object.entries(object).map(([name, details]) => ({
    name,
    ...details,
  }));
}
