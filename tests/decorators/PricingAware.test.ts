import { PricingContext, PricingContextManager } from '../../src/server/server';
import { PricingAware } from '../../src/server/decorators/PricingAware';

export class PricingContextImpl extends PricingContext {
  private static jwtExpirationTime = 86400000;

  getConfigFilePath(): string {
    return 'tests/resources/pricing/full/petclinic.yml';
  }

  getJwtSecret(): string {
    return 'secret';
  }

  getJwtExpiration(): number {
    return PricingContextImpl.jwtExpirationTime;
  }

  getUserContext(): Record<string, boolean | string | number> {
    return {
      username: 'test-user',
      pets: 2,
      visits: 2,
    };
  }

  getUserPlan(): string {
    return 'GOLD';
  }

  static setJwtExpirationTime(time: number): void {
    this.jwtExpirationTime = time;
  }
}

class SampleService {
  @PricingAware('pets')
  methodThatRequiresPetsFeature() {
    return 'This a method that requires the pets feature to be enabled';
  }
  
  @PricingAware('consultations')
  methodThatRequiresConsultationsFeature() {
    return 'This a method that requires the consultations feature to be enabled';
  }
}

describe('PricingAware decorator tests with PricingContextImpl', () => {
  let sampleService: SampleService;

  beforeAll(() => {
    const pricingContext: PricingContext = new PricingContextImpl();

    PricingContextManager.registerContext(pricingContext);

    sampleService = new SampleService();
  });

  it('should throw an error when calling a method that requires the pets feature', () => {
    expect(sampleService.methodThatRequiresPetsFeature()).toBe(
      'This a method that requires the pets feature to be enabled'
    );
  });

  it('should throw an error when calling a method that requires the consultations feature', () => {
    expect(() => sampleService.methodThatRequiresConsultationsFeature()).toThrow(
      'Feature consultations is not enabled for the current user!'
    );
  });
});
