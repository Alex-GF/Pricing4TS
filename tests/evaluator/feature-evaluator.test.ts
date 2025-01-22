import { evaluateFeature, PricingContext, PricingContextManager } from "../../src/server/server";
import { ExtendedFeatureStatus } from "../../src/server/utils/pricing-evaluator";

export class PricingContextImpl extends PricingContext {
  
    private static jwtExpirationTime = 86400000;
    private static pets: number = 2;
  
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
      pets: PricingContextImpl.pets,
      visits: 2,
    };
  }

  getUserPlan(): string {
    return 'GOLD';
  }

  static setJwtExpirationTime(time: number): void {
    this.jwtExpirationTime = time;
  }

  static setPets(pets: number): void {
    this.pets = pets;
  }
}

describe('check single feature evaluation', () => {

    beforeAll(() => {
        const pricingContext: PricingContext = new PricingContextImpl();
    
        PricingContextManager.registerContext(pricingContext);
      });

    it('should evaluate petclinic\'s \'pets\' feature as true', () => {
        const evaluationResult = evaluateFeature('pets');
        expect(evaluationResult.eval).toBe(true);
        expect(evaluationResult.used).toBe(2);
        expect(evaluationResult.limit).toBe(4);
    });

    it('should evaluate petclinic\'s \'pets\' feature as true', () => {
        PricingContextImpl.setPets(10);
        const evaluationResult = evaluateFeature('pets');
        expect(evaluationResult.eval).toBe(false);
        expect(evaluationResult.used).toBe(10);
        expect(evaluationResult.limit).toBe(4);
        PricingContextImpl.setPets(2);
    });

    it('should evaluate petclinic\'s \'consultations\' feature as false', () => {
        const evaluationResult = evaluateFeature('consultations');
        expect(evaluationResult.eval).toBe(false);
    });

    it('given a feature that does not exist, should throw an error', () => {
      const evaluationResult: ExtendedFeatureStatus = evaluateFeature('non-existing-feature');
      expect(evaluationResult.error?.code).toBe("FLAG_NOT_FOUND");
    });
});