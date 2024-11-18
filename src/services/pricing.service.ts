import { Pricing } from '../main';
import PricingCSP from '../models/minizinc/minizinc';
import { pricing2DZN } from '../utils/dzn-exporter/pricing-dzn-exporter';
import { PricingOperation } from '../models/minizinc/minizinc';
import { ErrorMessage } from 'minizinc';

export interface PricingAnalytics {
  numberOfPlans: number;
  numberOfAddOns: number;
  configurationSpaceSize: number;
}

export default class PricingService {

  private readonly pricing: Pricing;

  constructor(pricing: Pricing){
    this.pricing = pricing;
  }

  async getAnalytics() {

    try{
      const configurationSpaceSize = await this._getConfigurationSpaceSize();
      return {
        numberOfPlans: this.pricing.plans.length,
        numberOfAddOns: this.pricing.addOns ? this.pricing.addOns.length : 0,
        configurationSpaceSize: configurationSpaceSize.statistics.nSolutions,
      };
    }catch(e){
      console.error(e);
      const dznPricing = pricing2DZN(this.pricing);
      console.error(dznPricing);
      throw new Error((e as ErrorMessage).message);
    }
  }
  
  async _getConfigurationSpaceSize() {
    const dznPricing = pricing2DZN(this.pricing);

    const model = new PricingCSP();
    return model.runPricingOperation(PricingOperation.CONFIGURATION_SPACE, dznPricing);
  }
}
