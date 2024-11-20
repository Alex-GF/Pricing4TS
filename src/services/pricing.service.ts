import { Pricing } from '../main';
import PricingCSP from '../models/minizinc/minizinc';
import { pricing2DZN } from '../utils/dzn-exporter/pricing-dzn-exporter';
import { PricingOperation } from '../models/minizinc/minizinc';
import { ErrorMessage } from 'minizinc';

export interface PricingAnalytics {
  numberOfFeatures: number;
  numberOfUsageLimits: number;
  numberOfPlans: number;
  numberOfAddOns: number;
  configurationSpaceSize: number;
  minSubscriptionPrice: number;
  maxSubscriptionPrice: number;
}

export default class PricingService {

  private readonly pricing: Pricing;

  constructor(pricing: Pricing){
    this.pricing = pricing;
  }

  async getAnalytics() {

    try{

      const dznPricing = pricing2DZN(this.pricing);

      // Run the Minizinc models for needed anayltics
      const [configurationSpaceResult, minSubscriptionPriceResult, maxSubscriptionPriceResult] = await Promise.all([
        this._getConfigurationSpaceSize(dznPricing),
        this._getMinSubscriptionPrice(dznPricing),
        this._getMaxSubscriptionPrice(dznPricing)
      ]);
      
      // Extraction of the analytics
      const numberOfFeatures: number = this.pricing.features.length;
      const numberOfInformationFeatures: number = this.pricing.features.filter(f => f.type === "INFORMATION").length;
      const numberOfIntegrationFeatures: number = this.pricing.features.filter(f => f.type === "INTEGRATION").length;
      const numberOfDomainFeatures: number = this.pricing.features.filter(f => f.type === "DOMAIN").length;
      const numberOfAutomationFeatures: number = this.pricing.features.filter(f => f.type === "AUTOMATION").length;
      const numberOfManagementFeatures: number = this.pricing.features.filter(f => f.type === "MANAGEMENT").length;
      const numberOfGuaranteeFeatures: number = this.pricing.features.filter(f => f.type === "GUARANTEE").length;
      const numberOfSupportFeatures: number = this.pricing.features.filter(f => f.type === "SUPPORT").length;
      const numberOfPaymentFeatures: number = this.pricing.features.filter(f => f.type === "PAYMENT").length;
      const numberOfUsageLimits: number = this.pricing.usageLimits ? this.pricing.usageLimits.length : 0;
      const numberOfRenewableUsageLimits: number = this.pricing.usageLimits ? this.pricing.usageLimits.filter(ul => ul.type === "RENEWABLE").length : 0;
      const numberOfNonRenewableUsageLimits: number = this.pricing.usageLimits ? this.pricing.usageLimits.filter(ul => ul.type === "NON_RENEWABLE").length : 0;
      const numberOfResponseDrivenUsageLimits: number = this.pricing.usageLimits ? this.pricing.usageLimits.filter(ul => ul.type === "RESPONSE_DRIVEN").length : 0;
      const numberOfTimeDrivenUsageLimits: number = this.pricing.usageLimits ? this.pricing.usageLimits.filter(ul => ul.type === "TIME_DRIVEN").length : 0;
      const numberOfPlans: number = this.pricing.plans ? this.pricing.plans.length : 0;
      const numberOfFreePlans: number = this.pricing.plans ? this.pricing.plans.filter(p => p.price === 0).length : 0;
      const numberOfPaidPlans: number = this.pricing.plans ? this.pricing.plans.filter(p => typeof(p.price) === "number" ? p.price > 0 : true).length : 0;
      const numberOfAddOns: number = this.pricing.addOns ? this.pricing.addOns.length : 0;
      const numberOfReplacementAddons: number = this.pricing.addOns ? this.pricing.addOns.filter(a => a.features || a.usageLimits).length : 0;
      const numberOfExtensionAddons: number = this.pricing.addOns ? this.pricing.addOns.filter(a => a.features || a.usageLimits ? false : a.usageLimitsExtensions).length : 0;
      const configurationSpaceSize: number = configurationSpaceResult.statistics.nSolutions;
      const minSubscriptionPrice: number = configurationSpaceSize !== 0 ? minSubscriptionPriceResult.solution!.output.json!["subscription_cost"] : null;
      const maxSubscriptionPrice: number = configurationSpaceSize !== 0 ? maxSubscriptionPriceResult.solution!.output.json!["subscription_cost"] : null;
      
      return {
        numberOfFeatures: numberOfFeatures,
        numberOfInformationFeatures: numberOfInformationFeatures,
        numberOfIntegrationFeatures: numberOfIntegrationFeatures,
        numberOfDomainFeatures: numberOfDomainFeatures,
        numberOfAutomationFeatures: numberOfAutomationFeatures,
        numberOfManagementFeatures: numberOfManagementFeatures,
        numberOfGuaranteeFeatures: numberOfGuaranteeFeatures,
        numberOfSupportFeatures: numberOfSupportFeatures,
        numberOfPaymentFeatures: numberOfPaymentFeatures,
        numberOfUsageLimits: numberOfUsageLimits,
        numberOfRenewableUsageLimits: numberOfRenewableUsageLimits,
        numberOfNonRenewableUsageLimits: numberOfNonRenewableUsageLimits,
        numberOfResponseDrivenUsageLimits: numberOfResponseDrivenUsageLimits,
        numberOfTimeDrivenUsageLimits: numberOfTimeDrivenUsageLimits,
        numberOfPlans: numberOfPlans,
        numberOfFreePlans: numberOfFreePlans,
        numberOfPaidPlans: numberOfPaidPlans,
        numberOfAddOns: numberOfAddOns,
        numberOfReplacementAddons: numberOfReplacementAddons,
        numberOfExtensionAddons: numberOfExtensionAddons,
        configurationSpaceSize: configurationSpaceSize,
        minSubscriptionPrice: parseFloat(minSubscriptionPrice.toFixed(2)),
        maxSubscriptionPrice: parseFloat(maxSubscriptionPrice.toFixed(2)),
      };
    }catch(e){
      throw new Error((e as ErrorMessage).message);
    }
  }
  
  async _getConfigurationSpaceSize(dznPricing: string) {
    const model = new PricingCSP();
    return model.runPricingOperation(PricingOperation.CONFIGURATION_SPACE, dznPricing);
  }

  async _getMinSubscriptionPrice(dznPricing: string) {
    const model = new PricingCSP();
    return model.runPricingOperation(PricingOperation.CHEAPEST_SUBSCRIPTION, dznPricing);
  }

  async _getMaxSubscriptionPrice(dznPricing: string) {
    const model = new PricingCSP();
    return model.runPricingOperation(PricingOperation.MOST_EXPENSIVE_SUBSCRIPTION, dznPricing);
  }
}
