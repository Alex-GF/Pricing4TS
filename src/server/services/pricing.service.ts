import { Pricing } from '../../types';
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

export interface AnalyticsOptions {
  printDzn: boolean;
}

const defaultAnalyticsOptions: AnalyticsOptions = {
  printDzn: false
}

export default class PricingService {

  private readonly pricing: Pricing;

  constructor(pricing: Pricing){
    this.pricing = pricing;
  }

  async runPricingOperation(pricingOperation: PricingOperation) {
    const dznPricing = pricing2DZN(this.pricing);
    const model = new PricingCSP();
    return model.runPricingOperation(pricingOperation, dznPricing);
  }

  async getAnalytics(analyticsOptions?: AnalyticsOptions) {

    if (!analyticsOptions){
      analyticsOptions = defaultAnalyticsOptions;
    }else{
      analyticsOptions = {...defaultAnalyticsOptions, ...analyticsOptions};
    }

    try{

      const dznPricing = pricing2DZN(this.pricing);

      if (analyticsOptions.printDzn){
        console.log(dznPricing);
      }

      // Run the Minizinc models for needed anayltics
      const [configurationSpaceResult, minSubscriptionPriceResult, maxSubscriptionPriceResult] = await Promise.all([
        this._getConfigurationSpaceSize(dznPricing),
        this._getMinSubscriptionPrice(dznPricing),
        this._getMaxSubscriptionPrice(dznPricing)
      ]);

      // Extract the list of features and usage limits by type
      
      const informationFeatures = Object.values(this.pricing.features).filter(f => f.type === "INFORMATION");
      const integrationFeatures = Object.values(this.pricing.features).filter(f => f.type === "INTEGRATION");
      const domainFeatures = Object.values(this.pricing.features).filter(f => f.type === "DOMAIN");
      const automationFeatures = Object.values(this.pricing.features).filter(f => f.type === "AUTOMATION");
      const managementFeatures = Object.values(this.pricing.features).filter(f => f.type === "MANAGEMENT");
      const guaranteeFeatures = Object.values(this.pricing.features).filter(f => f.type === "GUARANTEE");
      const supportFeatures = Object.values(this.pricing.features).filter(f => f.type === "SUPPORT");
      const paymentFeatures = Object.values(this.pricing.features).filter(f => f.type === "PAYMENT");

      // Extraction of the analytics
      const numberOfFeatures: number = Object.values(this.pricing.features).length;
      const numberOfInformationFeatures: number = informationFeatures.length;
      const numberOfIntegrationFeatures: number = integrationFeatures.length;
      const numberOfIntegrationApiFeatures: number = integrationFeatures.filter(f => f.integrationType === "API").length;
      const numberOfIntegrationExtensionFeatures: number = integrationFeatures.filter(f => f.integrationType === "EXTENSION").length;
      const numberOfIntegrationIdentityProviderFeatures: number = integrationFeatures.filter(f => f.integrationType === "IDENTITY_PROVIDER").length;
      const numberOfIntegrationWebSaaSFeatures: number = integrationFeatures.filter(f => f.integrationType === "WEB_SAAS").length;
      const numberOfIntegrationMarketplaceFeatures: number = integrationFeatures.filter(f => f.integrationType === "MARKETPLACE").length;
      const numberOfIntegrationExternalDeviceFeatures: number = integrationFeatures.filter(f => f.integrationType === "EXTERNAL_DEVICE").length;
      const numberOfDomainFeatures: number = domainFeatures.length;
      const numberOfAutomationFeatures: number = automationFeatures.length;
      const numberOfBotAutomationFeatures: number = automationFeatures.filter(f => f.automationType === "BOT").length;
      const numberOfFilteringAutomationFeatures: number = automationFeatures.filter(f => f.automationType === "FILTERING").length;
      const numberOfTrackingAutomationFeatures: number = automationFeatures.filter(f => f.automationType === "TRACKING").length;
      const numberOfTaskAutomationFeatures: number = automationFeatures.filter(f => f.automationType === "TASK_AUTOMATION").length;
      const numberOfManagementFeatures: number = managementFeatures.length;
      const numberOfGuaranteeFeatures: number = guaranteeFeatures.length;
      const numberOfSupportFeatures: number = supportFeatures.length;
      const numberOfPaymentFeatures: number = paymentFeatures.length;
      const numberOfUsageLimits: number = this.pricing.usageLimits ? Object.values(this.pricing.usageLimits).length : 0;
      const numberOfRenewableUsageLimits: number = this.pricing.usageLimits ? Object.values(this.pricing.usageLimits).filter(ul => ul.type === "RENEWABLE").length : 0;
      const numberOfNonRenewableUsageLimits: number = this.pricing.usageLimits ? Object.values(this.pricing.usageLimits).filter(ul => ul.type === "NON_RENEWABLE").length : 0;
      const numberOfResponseDrivenUsageLimits: number = this.pricing.usageLimits ? Object.values(this.pricing.usageLimits).filter(ul => ul.type === "RESPONSE_DRIVEN").length : 0;
      const numberOfTimeDrivenUsageLimits: number = this.pricing.usageLimits ? Object.values(this.pricing.usageLimits).filter(ul => ul.type === "TIME_DRIVEN").length : 0;
      const numberOfPlans: number = this.pricing.plans ? Object.values(this.pricing.plans).length : 0;
      const numberOfFreePlans: number = this.pricing.plans ? Object.values(this.pricing.plans).filter(p => p.price === 0).length : 0;
      const numberOfPaidPlans: number = this.pricing.plans ? Object.values(this.pricing.plans).filter(p => typeof(p.price) === "number" ? p.price > 0 : true).length : 0;
      const numberOfAddOns: number = this.pricing.addOns ? Object.values(this.pricing.addOns).length : 0;
      const numberOfReplacementAddons: number = this.pricing.addOns ? Object.values(this.pricing.addOns).filter(a => a.features || a.usageLimits).length : 0;
      const numberOfExtensionAddons: number = this.pricing.addOns ? Object.values(this.pricing.addOns).filter(a => a.features || a.usageLimits ? false : a.usageLimitsExtensions).length : 0;
      const configurationSpaceSize: number = configurationSpaceResult.statistics.nSolutions;
      const minSubscriptionPrice: number = configurationSpaceSize !== 0 ? minSubscriptionPriceResult.solution!.output.json!["subscription_cost"] : null;
      const maxSubscriptionPrice: number = configurationSpaceSize !== 0 ? maxSubscriptionPriceResult.solution!.output.json!["subscription_cost"] : null;
      
      return {
        numberOfFeatures: numberOfFeatures,
        numberOfInformationFeatures: numberOfInformationFeatures,
        numberOfIntegrationFeatures: numberOfIntegrationFeatures,
        numberOfIntegrationApiFeatures: numberOfIntegrationApiFeatures,
        numberOfIntegrationExtensionFeatures: numberOfIntegrationExtensionFeatures,
        numberOfIntegrationIdentityProviderFeatures: numberOfIntegrationIdentityProviderFeatures,
        numberOfIntegrationWebSaaSFeatures: numberOfIntegrationWebSaaSFeatures,
        numberOfIntegrationMarketplaceFeatures: numberOfIntegrationMarketplaceFeatures,
        numberOfIntegrationExternalDeviceFeatures: numberOfIntegrationExternalDeviceFeatures,
        numberOfDomainFeatures: numberOfDomainFeatures,
        numberOfAutomationFeatures: numberOfAutomationFeatures,
        numberOfBotAutomationFeatures: numberOfBotAutomationFeatures,
        numberOfFilteringAutomationFeatures: numberOfFilteringAutomationFeatures,
        numberOfTrackingAutomationFeatures: numberOfTrackingAutomationFeatures,
        numberOfTaskAutomationFeatures: numberOfTaskAutomationFeatures,
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
