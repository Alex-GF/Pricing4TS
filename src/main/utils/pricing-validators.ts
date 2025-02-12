import type { AddOn } from '../models/pricing2yaml/addon';
import type { AutomationType, Feature, IntegrationType, PaymentType } from '../../types';
import type { Plan } from '../models/pricing2yaml/plan';
import type { Pricing } from '../models/pricing2yaml/pricing';
import type { FeatureType, RenderMode, UsageLimitType, ValueType } from '../models/pricing2yaml/types';
import type { ContainerUsageLimits, UsageLimit } from '../models/pricing2yaml/usage-limit';
import * as cc from 'currency-codes';

const VERSION_REGEXP = /^\d+\.\d+$/;

export function validateName(name: string | null, item: string): string {
  if (name === null || name === undefined) {
    throw new Error(`The ${item} must have a name`);
  }

  if (typeof name !== 'string') {
    throw new Error(`The ${item} name must be a string`);
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    throw new Error(`The ${item} name must not be empty`);
  }

  if (trimmedName.length < 3) {
    throw new Error(`The ${item} name must have at least 3 characters`);
  }

  if (trimmedName.length > 255) {
    throw new Error(`The ${item} name must have at most 255 characters`);
  }

  return trimmedName;
}

export function validateSyntaxVersion(version: string): string {
  if (version === null || version === undefined) {
    throw new Error(
      `The syntaxVersion field of the pricing must not be null or undefined. Please ensure that the syntaxVersion field is present and correctly formatted`
    );
  }

  if (typeof version !== 'string' || !VERSION_REGEXP.test(version)) {
    throw new Error(
      `The syntaxVersion field of the pricing does not follow the required structure: X.Y (being X and Y numbers). Please ensure it is a string in the format X.Y`
    );
  }

  return version;
}

export function validateVersion(version: string | undefined, createdAt: Date): string {
  if (version === null || version === undefined) {
    version = `${createdAt.getFullYear()}-${createdAt.getMonth() + 1}-${createdAt.getDate()}`;
  }

  if (typeof version !== 'string') {
    throw new Error(
      `The version field of the pricing must be a string. Please ensure that the version field is present and correctly formatted`
    );
  }

  return version;
}

export function validateCreatedAt(createdAt: string | Date | null): Date {
  if (createdAt === null || createdAt === undefined) {
    throw new Error(
      `The createdAt field must not be null or undefined. Please ensure that the createdAt field is present and correctly formatted (as Date or string)`
    );
  }

  if (typeof createdAt === 'string') {
    createdAt = new Date(createdAt);
  }

  if (!(createdAt instanceof Date) || isNaN(createdAt.getTime())) {
    throw new Error(
      `The createdAt field must be a valid Date object or a string in a recognized date format`
    );
  }

  const now = new Date();
  if (createdAt > now) {
    throw new Error(`The createdAt field must not be a future date`);
  }

  return createdAt;
}

export function validateCurrency(currency: string | null): string {
  if (currency === null || currency === undefined) {
    throw new Error(
      `The currency field of the pricing must not be null or undefined. Please ensure that the currency field is present and correctly formatted`
    );
  }

  if (typeof currency !== 'string') {
    throw new Error(`The currency field of the pricing must be a string`);
  }

  const trimmedCurrency = currency.trim();

  if (trimmedCurrency.length === 0) {
    throw new Error(`The currency field of the pricing must not be empty`);
  }

  const currencyCode = cc.code(trimmedCurrency);

  if (!currencyCode) {
    throw new Error(`The currency code ${trimmedCurrency} is not a valid ISO 4217 currency code`);
  }

  return currency;
}

export function validateDescription(description: string | null | undefined): string | undefined {
  if (description === null) {
    description = undefined;
  }

  return description;
}

export function validateValueType(valueType: string | null): ValueType {
  if (valueType === null || valueType === undefined) {
    throw new Error(
      `The valueType field of a feature must not be null or undefined. Please ensure that the valueType field is present and it's value correspond to either BOOLEAN, NUMERIC or TEXT`
    );
  }

  if (typeof valueType !== 'string') {
    throw new Error(
      `The valueType field of a feature must be a string, and its value must be either BOOLEAN, NUMERIC or TEXT. Received: ${valueType} `
    );
  }

  valueType = valueType.trim().toUpperCase();

  if (!['NUMERIC', 'BOOLEAN', 'TEXT'].includes(valueType)) {
    throw new Error(
      `The valueType field of a feature must be one of NUMERIC, BOOLEAN, or TEXT. Received: ${valueType}`
    );
  }

  return valueType as ValueType;
}

export function validateDefaultValue(
  elem: Feature | UsageLimit,
  item: string
): number | boolean | string | PaymentType[] {
  if (elem.defaultValue === null || elem.defaultValue === undefined) {
    throw new Error(
      `The defaultValue field of a ${item} must not be null or undefined. Please ensure that the defaultValue field is present and its defaultValue type correspond to the declared valueType`
    );
  }

  switch (elem.valueType) {
    case 'NUMERIC':
      if (typeof elem.defaultValue !== 'number') {
        throw new Error(
          `The defaultValue field of a ${item} must be a number when its valueType is NUMERIC. Received: ${elem.defaultValue}`
        );
      }
      break;
    case 'BOOLEAN':
      if (typeof elem.defaultValue !== 'boolean') {
        throw new Error(
          `The defaultValue field of a ${item} must be a boolean when its valueType is BOOLEAN. Received: ${elem.defaultValue}`
        );
      }
      break;
    case 'TEXT':
      if (elem.type === 'PAYMENT') {
        if (!(elem.defaultValue instanceof Array) || elem.defaultValue.length === 0) {
          throw new Error(`Payment method value must be an array of payment methods and not empty`);
        }
        for (const paymentMethod of elem.defaultValue) {
          if (
            !['CARD', 'GATEWAY', 'INVOICE', 'ACH', 'WIRE_TRANSFER', 'OTHER'].includes(paymentMethod)
          ) {
            throw new Error(
              `Invalid payment method: ${paymentMethod}. Please provide one of the following: CARD, GATEWAY, INVOICE, ACH, WIRE_TRANSFER, OTHER`
            );
          }
        }
        break;
      }
      if (typeof elem.defaultValue !== 'string') {
        throw new Error(
          `The defaultValue field of a ${item} must be a string when its valueType is TEXT. Received: ${elem.defaultValue}`
        );
      }
      break;
    default:
      throw new Error(
        `The valueType field of a ${item} must be either BOOLEAN, NUMERIC or TEXT. Received: ${elem.valueType}`
      );
  }

  return elem.defaultValue;
}

export function validateExpression(
  expression: string | null | undefined,
  item: string
): string | undefined {
  if (expression === null) {
    expression = undefined;
  }

  if (typeof expression === 'string') {
    if (expression.trim().length === 0) {
      throw new Error(
        `The ${item} field of a feature must not be empty. If you don't want to declare an expression for this feature, either use null or undefined`
      );
    }
  }

  return expression;
}

export function validateValue(
  elem: Feature | UsageLimit,
  item: string
): number | boolean | string | PaymentType[] | undefined {
  if (elem.value === null || elem.value === undefined) {
    elem.value = undefined;
  }

  switch (elem.valueType) {
    case 'NUMERIC':
      if (typeof elem.value !== 'number' && elem.value !== undefined) {
        throw new Error(
          `The value field of a ${item} must be a number when its valueType is NUMERIC. Received: ${elem.value}`
        );
      }
      break;
    case 'BOOLEAN':
      if (typeof elem.value !== 'boolean' && elem.value !== undefined) {
        throw new Error(
          `The value field of a ${item} must be a boolean when its valueType is BOOLEAN. Received: ${elem.value}`
        );
      }
      break;
    case 'TEXT':
      if (elem.type === 'PAYMENT' && elem.value !== undefined) {
        if (!(elem.value instanceof Array) || elem.value.length === 0) {
          throw new Error(`Payment method value must be an array of payment methods and not empty`);
        }
        for (const paymentMethod of elem.value) {
          if (
            !['CARD', 'GATEWAY', 'INVOICE', 'ACH', 'WIRE_TRANSFER', 'OTHER'].includes(paymentMethod)
          ) {
            throw new Error(
              `Invalid payment method: ${paymentMethod}. Please provide one of the following: CARD, GATEWAY, INVOICE, ACH, WIRE_TRANSFER, OTHER`
            );
          }
        }
        break;
      }
      if (typeof elem.value !== 'string' && elem.value !== undefined) {
        throw new Error(
          `The value field of a ${item} must be a string when its valueType is TEXT. Received: ${elem.value}`
        );
      }
      break;
    default:
      throw new Error(
        `The valueType field of a ${item} must be either BOOLEAN, NUMERIC or TEXT. Received: ${elem.valueType}`
      );
  }

  return elem.value;
}

export function validateFeatureType(type: string | null | undefined): FeatureType {
  if (type === null || type === undefined) {
    throw new Error(
      `The type field of a feature must not be null or undefined. Please ensure that the type field is present and it's value correspond to either INFORMATION, INTEGRATION, DOMAIN, AUTOMATION, MANAGEMENT, GUARANTEE, SUPPORT or PAYMENT`
    );
  }

  if (typeof type !== 'string') {
    throw new Error(
      `The type field of a feature must be a string, and its value must be either INFORMATION, INTEGRATION, DOMAIN, AUTOMATION, MANAGEMENT, GUARANTEE, SUPPORT or PAYMENT. Received: ${type} `
    );
  }

  type = type.trim().toUpperCase();

  if (
    ![
      'INFORMATION',
      'INTEGRATION',
      'DOMAIN',
      'AUTOMATION',
      'MANAGEMENT',
      'GUARANTEE',
      'SUPPORT',
      'PAYMENT',
    ].includes(type)
  ) {
    throw new Error(
      `The type field of a feature must be one of INFORMATION, INTEGRATION, DOMAIN, AUTOMATION, MANAGEMENT, GUARANTEE, SUPPORT or PAYMENT. Received: ${type}`
    );
  }

  return type as FeatureType;
}

export function validateFeatureIntegrationType(integrationType: IntegrationType | null | undefined){
  if (integrationType === null || integrationType === undefined) {
    integrationType = undefined;
  }

  if (integrationType && typeof integrationType !== 'string') {
    throw new Error(`The integrationType field of a feature must be an IntegrationType ('API' | 'EXTENSION' | 'IDENTITY_PROVIDER' | 'WEB_SAAS' | 'MARKETPLACE' | 'EXTERNAL_DEVICE'). Received: ${integrationType}`);
  }

  return integrationType;
}

export function validateFeatureAutomationType(automationType: AutomationType | null | undefined){
  if (automationType === null || automationType === undefined) {
    automationType = undefined;
  }

  if (automationType && typeof automationType !== 'string') {
    throw new Error(`The automationType field of a feature must be an AutomationType ('BOT' | 'FILTERING' | 'TRACKING' | 'TASK_AUTOMATION'). Received: ${automationType}`);
  }

  return automationType;
}

export function validateUnit(unit: string | null | undefined): string {
  if (unit === null || unit === undefined) {
    unit = "";
  }

  if (typeof unit !== 'string') {
    throw new Error(`The unit field of a usage limit must be a string. Received: ${unit} `);
  }

  return unit;
}

export function validateUsageLimitType(type: string | null | undefined): UsageLimitType {
  if (type === null || type === undefined) {
    throw new Error(
      `The type field of a usage limit must not be null or undefined. Please ensure that the type field is present and it's value correspond to either RENEWABLE, NON_RENEWABLE, TIME_DRIVEN or RESPONSE_DRIVEN`
    );
  }

  if (typeof type !== 'string') {
    throw new Error(
      `The type field of a usage limit must be a string, and its value must be either RENEWABLE, NON_RENEWABLE, TIME_DRIVEN or RESPONSE_DRIVEN. Received: ${type} `
    );
  }

  type = type.trim().toUpperCase();

  if (!['RENEWABLE', 'NON_RENEWABLE', 'TIME_DRIVEN', 'RESPONSE_DRIVEN'].includes(type)) {
    throw new Error(
      `The type field of a usage limit must be one of RENEWABLE, NON_RENEWABLE, TIME_DRIVEN or RESPONSE_DRIVEN. Received: ${type}`
    );
  }

  return type as UsageLimitType;
}

export function validateLinkedFeatures(
  linkedFeatures: string[] | undefined | null,
  pricing: Pricing
): string[] | undefined {
  if (linkedFeatures === null) {
    linkedFeatures = undefined;
  }

  // Check if linked features is an array
  if (Array.isArray(linkedFeatures)) {
    const pricingFeatures = Object.values(pricing.features).map((f) => f.name);

    for (const featureName of linkedFeatures) {
      if (!pricingFeatures.includes(featureName)) {
        throw new Error(
          `The feature ${featureName}, declared as a linked feature for an usage limit, is not defined in the global features`
        );
      }
    }
  }

  return linkedFeatures;
}

export function validateRenderMode(renderMode: string | undefined | null): RenderMode {
  if (renderMode === null || renderMode === undefined) {
    renderMode = 'AUTO';
  }

  renderMode = renderMode.toUpperCase();

  if (!['AUTO', 'ENABLED', 'DISABLED'].includes(renderMode)) {
    throw new Error(
      `The render field of a feature or usage limit must be one of AUTO, ENABLED or DISABLED. Received: ${renderMode}`
    );
  }

  return renderMode as RenderMode;
}

export function validatePlanFeatures(
  plan: Plan,
  planFeatures: Record<string, Feature>
): Record<string, Feature> {
  const featuresModifiedByPlan = plan.features;
  plan.features = planFeatures;

  for (const planFeature of Object.values(featuresModifiedByPlan)) {
    try {
      if (!Object.values(planFeatures).some((f) => f.name === planFeature.name)) {
        throw new Error(`Feature ${planFeature.name} is not defined in the global features.`);
      }

      const featureWithDefaultValue = Object.values(plan.features).find(
        (f) => f.name === planFeature.name
      ) as Feature;

      featureWithDefaultValue.value = planFeature.value;
    } catch (err) {
      throw new Error(
        `Error while parsing the feature ${planFeature.name} of the plan ${plan.name}. Error: ${
          (err as Error).message
        }`
      );
    }
  }

  return plan.features;
}

export function validatePlanUsageLimits(
  plan: Plan,
  planUsageLimits: ContainerUsageLimits
): ContainerUsageLimits {
  const usageLimitsModifiedByPlan = plan.usageLimits!;
  plan.usageLimits = planUsageLimits;

  for (const planUsageLimit of Object.values(usageLimitsModifiedByPlan)) {
    try {
      if (!Object.values(planUsageLimits).some((l) => l.name === planUsageLimit.name)) {
        throw new Error(
          `Usage limit ${planUsageLimit.name} is not defined in the global usage limits.`
        );
      }

      const globalUsageLimit = Object.values(planUsageLimits).find(
        (l) => l.name === planUsageLimit.name
      ) as UsageLimit;

      globalUsageLimit.value = planUsageLimit.value;
    } catch (err) {
      throw new Error(
        `Error while parsing the usage limit ${planUsageLimit.name} of the plan ${
          plan.name
        }. Error: ${(err as Error).message}`
      );
    }
  }

  return plan.usageLimits;
}

export function validatePrice(price: number | string | undefined | null, variables: {[key: string]: boolean | string | number}): number | string {
  if (price === null || price === undefined) {
    throw new Error(
      `The price field must not be null or undefined. Please ensure that the price field is present and it's a number`
    );
  }

  if (typeof price !== 'string' && typeof price !== 'number') {
    throw new Error(
      `The price field must be a number or a string (which can contain a formula). Received: ${price}`
    );
  }

  if (typeof price === 'number' && price < 0) {
    throw new Error(`The price field must be a positive number. Received: ${price} `);
  }

  if (typeof price === 'string') {
    if (price.includes('#')) {
      for (const [variable, value] of Object.entries(variables)) {
        price = price.replace(`#${variable}`, `${typeof value === "string" ? `'${value}'` : value}`);
      }

      try {
        // eslint-disable-next-line no-eval
        const evaluatedPrice = eval(price);
        if (typeof evaluatedPrice !== 'number' || isNaN(evaluatedPrice)) {
          throw new Error(`The evaluated price must result in a valid number. Current result after evaluation: ${evaluatedPrice}`);
        }
        price = evaluatedPrice;
      } catch (err) {
        throw new Error(`Error evaluating the price formula: ${(err as Error).message}`);
      }
      
    } else if (price.match(/^[0-9]+(\.[0-9]+)?$/)) {
      price = parseFloat(price);
    }
  }

  return price;
}

export function validateAddonFeatures(
  addon: AddOn,
  addOnFeatures: Record<string, Feature>
): Record<string, Feature> {
  for (const addOnFeature of Object.values(addon.features!)) {
    try {
      if (!Object.values(addOnFeatures).some((f) => f.name === addOnFeature.name)) {
        throw new Error(`Feature ${addOnFeature.name} is not defined in the global features.`);
      }

      addon.features![addOnFeature.name].value = addOnFeature.value;
    } catch (err) {
      throw new Error(
        `Error while parsing the feature ${addOnFeature.name} of the plan ${addon.name}. Error: ${
          (err as Error).message
        }`
      );
    }
  }

  return addon.features as Record<string, Feature>;
}

export function validateAddonUsageLimits(
  addon: AddOn,
  addonUsageLimits: ContainerUsageLimits
): ContainerUsageLimits {
  for (const addonUsageLimit of Object.values(addon.usageLimits!)) {
    try {
      if (!Object.values(addonUsageLimits).some((l) => l.name === addonUsageLimit.name)) {
        throw new Error(
          `Usage limit ${addonUsageLimit.name} is not defined in the global usage limits.`
        );
      }
      if (!("value" in addonUsageLimit)){
        throw new Error("When declaring a new value for an usage limit or a usage limit extension within an add-on, it must be provided through the 'value' field")
      }
      addon.usageLimits![addonUsageLimit.name].value = addonUsageLimit.value;
    } catch (err) {
      throw new Error(
        `Error while parsing the usage limit ${addonUsageLimit.name} of the add-on ${
          addon.name
        }. Error: ${(err as Error).message}`
      );
    }
  }

  return addon.usageLimits as ContainerUsageLimits;
}

export function validateAddonUsageLimitsExtensions(
  addon: AddOn,
  addonUsageLimits: ContainerUsageLimits
): ContainerUsageLimits {
  for (const addonUsageLimitExtension of Object.values(addon.usageLimitsExtensions!)) {
    try {
      if (!Object.values(addonUsageLimits).some((l) => l.name === addonUsageLimitExtension.name)) {
        throw new Error(
          `Usage limit ${addonUsageLimitExtension.name} is not defined in the global usage limits.`
        );
      }
      if (!("value" in addonUsageLimitExtension)){
        throw new Error("When declaring a new value for an usage limit or a usage limit extension within an add-on, it must be provided through the 'value' field")
      }
      addon.usageLimitsExtensions![addonUsageLimitExtension.name].value =
        addonUsageLimitExtension.value;
    } catch (err) {
      throw new Error(
        `Error while parsing the usage limit ${addonUsageLimitExtension.name} of the add-on ${
          addon.name
        }. Error: ${(err as Error).message}`
      );
    }
  }

  return addon.usageLimitsExtensions as ContainerUsageLimits;
}

export function validateAvailableFor(
  availableFor: string[] | undefined | null,
  pricing: Pricing
): string[] {
  const planNames = pricing.plans ? Object.values(pricing.plans).map((p) => p.name) : [];

  if (availableFor === null || availableFor === undefined) {
    availableFor = planNames as string[];
  }

  if (!Array.isArray(availableFor)) {
    throw new Error(
      `The availableFor field must be an array of the plan names for which the addon can be contracted. Received: ${availableFor}`
    );
  }

  for (const planName of availableFor) {
    if (!planNames.includes(planName)) {
      throw new Error(`The plan ${planName} is not defined in the pricing.`);
    }
  }

  return availableFor;
}

export function validateDependsOnOrExcludes(
  fieldValue: string[] | undefined | null,
  pricing: Pricing,
  fieldType: "dependsOn" | "excludes"
): string[] {
  const addonNames = pricing.addOns ? Object.values(pricing.addOns).map((a) => a.name) : [];

  if (fieldValue === null || fieldValue === undefined) {
    fieldValue = [];
  }

  if (!Array.isArray(addonNames)) {
    throw new Error(
      `The ${fieldType} field must be an array of the addons required to contract the addon. Received: ${fieldValue}`
    );
  }

  return fieldValue;
}

export function postValidateDependsOnOrExclude(fieldValue: string[] | undefined, pricing: Pricing): void {
  const addonNames = pricing.addOns ? Object.values(pricing.addOns).map((a) => a.name) : [];

  if (!fieldValue) return;

  for (const addonName of fieldValue) {
    if (!addonNames.includes(addonName)) {
      throw new Error(`The addon ${addonName} is not defined in the pricing.`);
    }
  }
}

export function validateTags(tags: string[] | undefined): string[] {
  
  if (tags === null || tags === undefined){
    return [];
  }
  
  if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string')) {
    throw new Error(`The tags field must be an array of strings.`);
  }

  return tags;
}

export function validatePlan(plan: Plan) {
  if (typeof plan === 'object' && "features" in plan) {
    return
  }else{
    throw new Error(`The plan must be an object of type Plan`)
  }
}

export function validatePlans(plans: object){
  if (!(typeof plans === 'object')) {
    throw new Error(`The plans field must be a map of Plan objects`);
  }
}

export function validateFeatures(features: object){
  if (!(typeof features === 'object') || features === null || features === undefined) {
    throw new Error(`The features field must be a map of Feature objects`);
  }
}

export function validateFeature(feature: Feature) {
  if (typeof feature === 'object' && "type" in feature && "valueType" in feature && "defaultValue" in feature) {
    return
  }else{
    throw new Error(`The feature must be an object of type Feature`)
  }
}

export function validateUsageLimits(usageLimits: object) {
  if (!(typeof usageLimits === 'object')) {
    throw new Error(`The usageLimits field must be a map of UsageLimit objects or undefined`);
  }
}

export function validateUsageLimit(usageLimit: UsageLimit) {
  if (typeof usageLimit === 'object' && "type" in usageLimit && "valueType" in usageLimit && "defaultValue" in usageLimit) {
    return
  }else{
    throw new Error(`The usage limit must be an object of type UsageLimit`)
  }
}

export function validateBilling(billing: {[key: string]: number} | undefined){
  
  if(billing === undefined || billing === null){
    billing = {
      "monthly": 1
    }
  }
  
  if (!(typeof billing === 'object')) {
    throw new Error(`The billing field must be an object of type {[key: string]: number}`);
  }

  for (const [key, value] of Object.entries(billing)) {
    if (typeof value !== 'number') {
      throw new Error(`The billing entry for ${key} must be a number. Received: ${value}`);
    }

    if (value <= 0 || value > 1) {
      throw new Error(`The billing entry for ${key} must be a value in the range (0,1]. Received: ${value}`);
    }
  }

  return billing;
}

export function validateVariables(variables: {[key: string]: number | string | boolean} | undefined){
  
  if(variables === undefined || variables === null){
    variables = {}
  }
  
  if (typeof variables !== 'object') {
    throw new Error(`The billing field must be an object of type {[key: string]: number | string | boolean}`);
  }

  for (const [key, value] of Object.entries(variables)) {
    if (typeof value !== 'number' && typeof value !== 'string' && typeof value !== 'boolean') {
      throw new Error(`The billing entry for ${key} must be either a number, a string or a boolean. Received: ${value}`);
    }
  }

  return variables;
}

export function validateUrl(url: string | undefined){
  if (url === undefined || url === null) {
    url = undefined;
    return
  }

  if (typeof url !== 'string') {
    throw new Error(`The url field must be a string. Received: ${url}`);
  }

  const urlPattern = /^(https?):\/\/[^\s\/$.?#].[^\s]*$/i;
  if (!urlPattern.test(url)) {
    throw new Error(`The url field must be a valid URL with the http or https protocol. Received: ${url}`);
  }

  return url;
}

export function validatePrivate(isPrivate: boolean | undefined){
  if (isPrivate === undefined || isPrivate === null) {
    isPrivate = false;
  }

  if (typeof isPrivate !== 'boolean') {
    throw new Error(`The private field must be a boolean. Received: ${isPrivate}`);
  }

  return isPrivate;
}