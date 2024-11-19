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

      const configurationSpaceSize = await this._getConfigurationSpaceSize(dznPricing);
      const minSubscriptionPrice = await this._getMinSubscriptionPrice(dznPricing);
      const maxSubscriptionPrice = await this._getMaxSubscriptionPrice(dznPricing);
      return {
        numberOfFeatures: this.pricing.features.length,
        numberOfUsageLimits: this.pricing.usageLimits ? this.pricing.usageLimits.length : 0,
        numberOfPlans: this.pricing.plans.length,
        numberOfAddOns: this.pricing.addOns ? this.pricing.addOns.length : 0,
        configurationSpaceSize: configurationSpaceSize.statistics.nSolutions,
        minSubscriptionPrice: minSubscriptionPrice,
        maxSubscriptionPrice: maxSubscriptionPrice,
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
