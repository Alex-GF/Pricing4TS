import { AddOn, Plan, Pricing } from "../../types";

export function explain(minizincError: string, pricing: Pricing): string {
  const [errorId, errorMessage] = minizincError.split(':');

  switch (errorId) {
    case "DeadFeatureError":
      return explainDeadFeatureError(pricing, errorMessage);
    default:
      return minizincError;
  }
}

function explainDeadFeatureError(pricing: Pricing, errorMessage: string): string {
  
  const pricingFeatures = Object.keys(pricing.features);
  const deadFeatures = [];

  for (const feature of pricingFeatures) {
    let isFeatureDead = !(_isFeatureInAnyPlan(feature, pricing.plans) || _isFeatureInAnyAddOn(feature, pricing.addOns));

    if (isFeatureDead) {
      deadFeatures.push(feature);
    }
  }
  
  return `${errorMessage} Found dead features: ` + deadFeatures.join(", ");
}

function _isFeatureInAnyPlan(feature: string, plans: Record<string, Plan> | undefined): boolean{
  if (plans){
    for (const plan of Object.values(plans)) {
      if (plan.features[feature].value || plan.features[feature].defaultValue) {
        return true;
      }
    }
  }
  
  return false;
}

function _isFeatureInAnyAddOn(feature: string, addOns: Record<string, AddOn> | undefined): boolean{
  if (addOns){
    for (const addOn of Object.values(addOns)) {
      if (addOn.features?.[feature]?.value) {
        return true;
      }
    }
  }
  
  return false;
}