import { AddOn, Plan, Pricing } from '../../types';
import { calculateOverriddenValue } from './dzn-exporter/number-utils';

export function explain(minizincError: string, pricing: Pricing): string {
  const [errorId, errorMessage] = minizincError.split(':');

  switch (errorId) {
    case 'InvalidUsageLimitValueError':
      return explainUsageLimitWithoutValueError(pricing, errorMessage);
    case 'DeadFeatureError':
      return explainDeadFeatureError(pricing, errorMessage);
    default:
      return minizincError;
  }
}

function explainUsageLimitWithoutValueError(pricing: Pricing, errorMessage: string): string {
  const pricingUsageLimits = pricing.usageLimits!;
  const usageLimitsWithoutValue = [];
  const featuresLinkedToManyUsageLimits = _findFeaturesLinkedToManyUsageLimits(pricing);
  console.log('featuresLinkedToManyUsageLimits', featuresLinkedToManyUsageLimits);
  for (const usageLimit of Object.values(pricingUsageLimits)) {
    const plansWithUsageLimitInactive = _plansWithInactiveUsageLimit(
      usageLimit.name,
      usageLimit.linkedFeatures,
      pricing,
      featuresLinkedToManyUsageLimits
    );
    const isUsageLimitInvalid = plansWithUsageLimitInactive.length > 0;

    if (isUsageLimitInvalid) {
      usageLimitsWithoutValue.push(`${usageLimit.name} in [${plansWithUsageLimitInactive}]`);
    }
  }

  return (
    `${errorMessage} Found usage limits without value > 0: ` + usageLimitsWithoutValue.join(', ')
  );
}

function explainDeadFeatureError(pricing: Pricing, errorMessage: string): string {
  const pricingFeatures = Object.keys(pricing.features);
  const deadFeatures = [];

  for (const feature of pricingFeatures) {
    let isFeatureDead = !(
      _isFeatureInAnyPlan(feature, pricing.plans) || _isFeatureInAnyAddOn(feature, pricing.addOns)
    );

    if (isFeatureDead) {
      deadFeatures.push(feature);
    }
  }

  return `${errorMessage} Found dead features: ` + deadFeatures.join(', ');
}

function _isFeatureInAnyPlan(feature: string, plans: Record<string, Plan> | undefined): boolean {
  if (plans) {
    for (const plan of Object.values(plans)) {
      if (plan.features[feature].value || plan.features[feature].defaultValue) {
        return true;
      }
    }
  }

  return false;
}

function _isFeatureInAnyAddOn(feature: string, addOns: Record<string, AddOn> | undefined): boolean {
  if (addOns) {
    for (const addOn of Object.values(addOns)) {
      if (addOn.features?.[feature]?.value) {
        return true;
      }
    }
  }

  return false;
}

function _plansWithInactiveUsageLimit(
  usageLimit: string,
  linkedFeatures: string[] | undefined,
  pricing: Pricing,
  featuresLinkedToManyUsageLimits: string[]
): string[] {

  const plansWithInactiveUsageLimit: string[] = [];

  if (pricing.plans && linkedFeatures && linkedFeatures.length > 0) {
    for (const plan of Object.values(pricing.plans)) {
      const planFeatures = plan.features;
      let isPlanWithLinkedFeatureActive = false;

      // If no feature linked to the limit is active in the plan, an inactive usage limit is not invalid, so there is no need to perform the evaluation
      for (const feature of Object.values(planFeatures)) {
        if (linkedFeatures.includes(feature.name)) {
          if (!featuresLinkedToManyUsageLimits.includes(feature.name) && (feature.value || feature.defaultValue)) {
            isPlanWithLinkedFeatureActive = true;
            break;
          }else if(featuresLinkedToManyUsageLimits.includes(feature.name)) {
            const usageLimitsLinkedToFeature = Object.values(pricing.usageLimits!).map(u => u.linkedFeatures?.includes(feature.name) );

            if (usageLimitsLinkedToFeature.some(u => calculateOverriddenValue(plan.usageLimits![usageLimit]) > 0)){
              isPlanWithLinkedFeatureActive = true;
              break;
            }
          }
        }
      }

      if (!isPlanWithLinkedFeatureActive) {
        continue;
      }

      const overridenValue = calculateOverriddenValue(plan.usageLimits![usageLimit]);

      if (overridenValue === 0) {
        plansWithInactiveUsageLimit.push(plan.name);
      }
    }
  }

  return plansWithInactiveUsageLimit;
}

function _findFeaturesLinkedToManyUsageLimits(pricing: Pricing){
  const pricingUsageLimits = pricing.usageLimits!;

  const linkedFeaturesCounter: Record<string, number> = {};

  for (const usageLimit of Object.values(pricingUsageLimits)) {
    const linkedFeatures = usageLimit.linkedFeatures;

    if (linkedFeatures) {
      for (const feature of linkedFeatures) {
        if (!linkedFeaturesCounter[feature]) {
          linkedFeaturesCounter[feature] = 0;
        }
        linkedFeaturesCounter[feature] += 1;
      }
    }
  }

  console.log(linkedFeaturesCounter)

  return Object.entries(linkedFeaturesCounter)
    .filter(([_, count]) => count > 1)
    .map(([feature]) => feature);
}