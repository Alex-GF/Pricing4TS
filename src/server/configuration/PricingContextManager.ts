import { PricingJwtUtils } from '../utils/pricing-jwt-utils';
import { PricingContext } from './PricingContext';

export class PricingContextManager {
  private static context: PricingContext | null = null;

  static registerContext(context: PricingContext): void {
    this.context = context;
    PricingJwtUtils.setContext(context);
  }

  static getContext(): PricingContext {
    if (!this.context) {
      throw new Error(
        "PricingContext is not registered. Call 'PricingContextManager.registerContext' first."
      );
    }
    return this.context;
  }
}
