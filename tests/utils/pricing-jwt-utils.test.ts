import { PricingContext } from '../../src/server/configuration/PricingContext';
import { PricingContextManager } from '../../src/server/server';
import { FeatureStatus, generateUserToken } from '../../src/server/utils/pricing-evaluator';
import { PricingJwtUtils } from '../../src/server/utils/pricing-jwt-utils';

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

describe('PricingJwtUtils tests using a sample PricingContext', () => {
  beforeAll(() => {
    const pricingContext: PricingContext = new PricingContextImpl();

    PricingContextManager.registerContext(pricingContext);
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  describe('Negative tests of PricingJwtUtils with PricingContextImpl', () => {
    it('should throw an error when decoding a token with passed expiration time', () => {
      PricingContextImpl.setJwtExpirationTime(1);

      const testToken = generateUserToken();

      PricingContextImpl.setJwtExpirationTime(86400000);

      jest.advanceTimersByTime(2);
      expect(() => PricingJwtUtils.decodeToken(testToken)).toThrow('Pricing token expired');
    });
  });

  describe('Positive tests of PricingJwtUtils with PricingContextImpl', () => {
    it(`token should contain subject from userContext's username`, () => {
      const testToken: string = generateUserToken();
      const expectedSubject: string = PricingContextManager.getContext().getUserContext()
        .username as string;

      expect(PricingJwtUtils.getSubjectFromJwtToken(testToken)).toBe(expectedSubject);
    });

    it('token should contain userContext', () => {
      const testToken: string = generateUserToken();
      const expectedUserContext: Record<string, boolean | string | number> =
        PricingContextManager.getContext().getUserContext();

      expect(PricingJwtUtils.decodeToken(testToken).userContext).toStrictEqual(expectedUserContext);
    });

    it('should update token with an expression to be evaluated in frontend', () => {
      const testToken: string = generateUserToken();
      const decodedToken: Record<string, any> = PricingJwtUtils.decodeToken(testToken);

      const newExpressionOfPetsFeature: string = "planContext['pets'] > localStorage['pets']";

      const newFeatureStatuses: Record<string, FeatureStatus> = {
        ...decodedToken.features,
        pets: {
          eval: newExpressionOfPetsFeature,
          used: null,
          limit: null,
        },
      };

      const updatedToken: string = PricingJwtUtils.updateTokenFeatures(
        testToken,
        newFeatureStatuses
      );

      expect(PricingJwtUtils.decodeToken(updatedToken).features['pets'].eval).toBe(
        newExpressionOfPetsFeature
      );
    });

    it('should update feature in token with an expression to be evaluated in frontend', () => {
      const testToken: string = generateUserToken();

      const newExpressionOfPetsFeature: string = "planContext['pets'] > localStorage['pets']";

      const updatedToken: string = PricingJwtUtils.updateEvalOfTokenFeature(
        testToken,
        'pets',
        newExpressionOfPetsFeature
      );

      expect(PricingJwtUtils.decodeToken(updatedToken).features['pets'].eval).toBe(
        newExpressionOfPetsFeature
      );
    });
  });
});