import type { AddOn } from '../../models/pricing2yaml/addon';
import type { Feature } from '../../models/pricing2yaml/feature';
import type { Plan } from '../../models/pricing2yaml/plan';
import {
  generateEmptyPricingToBeWritten,
  Pricing,
  PricingToBeWritten,
} from '../../models/pricing2yaml/pricing';
import type { UsageLimit } from '../../models/pricing2yaml/usage-limit';

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

export function serializePricing(pricing: Pricing): PricingToBeWritten {
  const pricingToBeWritten = generateEmptyPricingToBeWritten();

  serializeBasicAttributes(pricing, pricingToBeWritten);
  serializeFeatures(pricing, pricingToBeWritten);
  serializeUsageLimits(pricing, pricingToBeWritten);
  serializePlans(pricing, pricingToBeWritten);
  serializeAddOns(pricing, pricingToBeWritten);

  return pricingToBeWritten;
}

function serializeBasicAttributes(pricing: Pricing, pricingToBeWritten: PricingToBeWritten) {
  pricingToBeWritten.saasName = pricing.saasName;
  pricingToBeWritten.version = pricing.version;
  pricingToBeWritten.createdAt = pricing.createdAt;
  pricingToBeWritten.currency = pricing.currency;
  pricingToBeWritten.hasAnnualPayment = pricing.hasAnnualPayment;
  pricingToBeWritten.tags = pricing.tags ? pricing.tags : undefined;
}

function serializeFeatures(pricing: Pricing, pricingToBeWritten: PricingToBeWritten) {
  pricingToBeWritten.features = _formatArrayIntoObjectForWriting(
    pricing.features
  ) as ContainerFeatures;
}

function serializeUsageLimits(pricing: Pricing, pricingToBeWritten: PricingToBeWritten) {
  pricingToBeWritten.usageLimits = pricing.usageLimits
    ? (_formatArrayIntoObjectForWriting(pricing.usageLimits) as ContainerUsageLimits)
    : undefined;
}

function serializePlans(pricing: Pricing, pricingToBeWritten: PricingToBeWritten) {
  pricingToBeWritten.plans = pricing.plans
    ? (_formatArrayIntoObjectForWriting(pricing.plans) as ContainerPlans)
    : undefined;

  pricingToBeWritten.plans &&
    Object.keys(pricingToBeWritten.plans).forEach(planName => {
      const plan: any = (pricingToBeWritten.plans! as ContainerPlans)[planName];
      const fieldsToFormat = ["features", "usageLimit"];

      for (let field of fieldsToFormat) {
        if (plan[field]){
          plan[field] = Object.entries(plan[field]).reduce(
            (acc: { [key: string]: Omit<Feature | UsageLimit, 'name'> }, [key, value]) => {
              const { name, ...rest } = value as Feature | UsageLimit;
              acc[key] = { ...rest };
              return acc;
            },
            {} as { [key: string]: Omit<Feature | UsageLimit, 'name'> }
          );
        }
      }
    });
}

function serializeAddOns(pricing: Pricing, pricingToBeWritten: PricingToBeWritten) {
  pricingToBeWritten.addOns = pricing.addOns
    ? (_formatArrayIntoObjectForWriting(pricing.addOns) as ContainerAddOns)
    : undefined;

  pricingToBeWritten.addOns &&
    Object.keys(pricingToBeWritten.addOns).forEach(addOnName => {
      const addOn: any = (pricingToBeWritten.addOns! as ContainerAddOns)[addOnName];
      const fieldsToFormat = [addOn.features, addOn.usageLimit, addOn.usageLimitExtensions];

      for (let field of fieldsToFormat) {
        if (addOn[field]) {
          addOn[field] = Object.entries(addOn[field]).reduce(
            (acc: { [key: string]: Omit<Feature | UsageLimit, 'name'> }, [key, value]) => {
              const { name, ...rest } = value as Feature | UsageLimit;
              acc[key] = { ...rest };
              return acc;
            },
            {} as { [key: string]: Omit<Feature | UsageLimit, 'name'> }
          );
        }
      }
    });
}

function _formatArrayIntoObjectForWriting(
  array: Array<{ name: string; [key: string]: any }>
): object | undefined {
  if (array.length === 0) {
    return undefined;
  }

  return array.reduce((acc: any, { name, ...rest }) => {
    acc[name] = { ...rest };
    return acc;
  }, {} as object | undefined);
}
