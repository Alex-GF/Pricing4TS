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
  pricingToBeWritten.createdAt = pricing.createdAt instanceof Date
    ? pricing.createdAt.toISOString().split('T')[0]
    : (pricing.createdAt as string).split('T')[0];
  pricingToBeWritten.currency = pricing.currency;
  pricingToBeWritten.hasAnnualPayment = pricing.hasAnnualPayment;
  pricingToBeWritten.tags = Array.isArray(pricing.tags) && pricing.tags.length > 0 ? pricing.tags : undefined;
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
      
      _formatPricingContainerFields(plan, "plan");
    });
}

function serializeAddOns(pricing: Pricing, pricingToBeWritten: PricingToBeWritten) {
  pricingToBeWritten.addOns = pricing.addOns
    ? (_formatArrayIntoObjectForWriting(pricing.addOns) as ContainerAddOns)
    : undefined;

  pricingToBeWritten.addOns &&
    Object.keys(pricingToBeWritten.addOns).forEach(addOnName => {
      const addOn: any = (pricingToBeWritten.addOns! as ContainerAddOns)[addOnName];
      
      addOn.dependsOn = Array.isArray(addOn.dependsOn) && addOn.dependsOn.length > 0 ? addOn.dependsOn : undefined;

      _formatPricingContainerFields(addOn, "addOn");
    });
}

function _formatPricingContainerFields(pricingContainer: any, pricingContainerType: "plan" | "addOn") {
  const fieldsToFormat = pricingContainerType === "plan" ? ["features", "usageLimits"] : ["features", "usageLimits", "usageLimitsExtensions"];

  for (let field of fieldsToFormat) {

    if (pricingContainer[field]) {

      const serializedField = Object.entries(pricingContainer[field]).reduce(
        (acc: { [key: string]: {value: string | number | boolean | string[]} | undefined }, [key, value]) => {
          if ((value as Feature | UsageLimit).value){
            acc[key] = { value: (value as Feature | UsageLimit).value! };
          }
          return acc;
        },
        {} as { [key: string]: {value: string | number | boolean | string[]} }
      );

      pricingContainer[field] = Object.keys(serializedField).length === 0 ? null : serializedField;
    }
  }
}

function _formatArrayIntoObjectForWriting(
  array: Array<{ name: string; [key: string]: any }>
): object | undefined {
  
  if(!Array.isArray(array)){
    return array;
  }
  
  if (array.length === 0) {
    return undefined;
  }

  return array.reduce((acc: any, { name, ...rest }) => {
    acc[name] = { ...rest };
    return acc;
  }, {} as object | undefined);
}