// deno-lint-ignore-file no-explicit-any

import { calculateNextVersion } from '../../version-manager';

export default function v21Tov30Updater(extractedPricing: any): any {
  const nextVersion = calculateNextVersion(extractedPricing.syntaxVersion);

  extractedPricing.syntaxVersion = nextVersion!;

  _replaceTimeDrivenAndResponseDrivenLimits(extractedPricing);
  _addSubscriptionConstraintsToAddOns(extractedPricing)
  _renameContextsInExpressions(extractedPricing);

  return extractedPricing;
}

function _replaceTimeDrivenAndResponseDrivenLimits(extractedPricing: any) {
  const usageLimits = extractedPricing.usageLimits;

  for (const usageLimitKey in usageLimits){
    const usageLimit = usageLimits[usageLimitKey];

    if (usageLimit.type === "TIME_DRIVEN") {
      usageLimit.type = "RENEWABLE";
      usageLimit.period = {
        value: 1,
        unit: "MONTH"
      }
    }else if (usageLimit.type === "RESPONSE_DRIVEN") {
      usageLimit.type = "NON_RENEWABLE";
      usageLimit.trackable = false
    }else if (usageLimit.type === "RENEWABLE" || usageLimit.type === "NON_RENEWABLE") {
      continue;
    }else{
      throw new Error(`Unsupported usage limit type: ${usageLimit.type}. Valid types are: RENEWABLE, NON_RENEWABLE, TIME_DRIVEN, RESPONSE_DRIVEN.`);
    }
  }
}

function _addSubscriptionConstraintsToAddOns(extractedPricing: any) {
  const addOns = extractedPricing.addOns;

  for (const addOnKey in addOns){
    const addOn = addOns[addOnKey];
    const isScalable = (addOn.features && Object.keys(addOn.features).length === 0) ||
                       (addOn.usageLimits && Object.keys(addOn.usageLimits).length === 0) ||
                       (addOn.usageLimitsExtensions && Object.keys(addOn.usageLimitsExtensions).length > 0);
    

    if (isScalable && !addOn.subscriptionConstraints) {
      addOn.subscriptionConstraints = {
        minQuantity: 1,
        maxQuantity: Infinity,
        quantityStep: 1
      }
    }
  }
}

function _renameContextsInExpressions(extractedPricing: any) {
  const features = extractedPricing.features;

  for (const featureKey in features){
    const feature = features[featureKey];
    if (feature.expression) {
      feature.expression = feature.expression.replace("planContext", "pricingContext");
      feature.expression = feature.expression.replace("userContext", "subscriptionContext");
    }

    if (feature.serverExpression) {
      feature.serverExpression = feature.serverExpression.replace("planContext", "pricingContext");
      feature.serverExpression = feature.serverExpression.replace("userContext", "subscriptionContext");
    }
  }
}