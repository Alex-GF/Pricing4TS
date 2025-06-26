import { Request, Response, NextFunction } from 'express';
import { checkFeature } from '../../src/server/middleware/feature-checker';
import { PricingContext } from '../../src/server/configuration/PricingContext';
import { PricingContextManager } from '../../src/server/server';
import { generateUserPricingToken } from '../../src/server/utils/pricing-evaluator';
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

  getSubscriptionContext(): Record<string, boolean | string | number> {
    return {
      username: 'test-user',
      pets: 2,
      visits: 2,
    };
  }

  getUserPlan(): string {
    return 'GOLD';
  }

  getUserAddOns(): string[] {
    return [];
  }

  static setJwtExpirationTime(time: number): void {
    this.jwtExpirationTime = time;
  }
}

describe('checkFeature middleware with PricingContextImpl', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let sendMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    sendMock = jest.fn();
    statusMock = jest.fn(() => ({ send: sendMock }));

    mockRequest = {
      header: jest.fn(),
    };

    mockResponse = {
      status: statusMock,
    };

    nextFunction = jest.fn();

    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  beforeAll(() => {
    const pricingContext: PricingContext = new PricingContextImpl();

    PricingContextManager.registerContext(pricingContext);
  });

  describe('Negative tests of checkFeature middleware with PricingContextImpl', () => {
    it('should return 401 if Pricing-Token header is not provided', () => {
      (mockRequest.header as jest.Mock).mockReturnValue(null);
  
      const middleware = checkFeature('pets');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
  
      expect(mockRequest.header).toHaveBeenCalledWith('Pricing-Token');
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(sendMock).toHaveBeenCalledWith('Pricing token not found');
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if a token with passed expiration time is provided', () => {
    
      PricingContextImpl.setJwtExpirationTime(1);
      
      const testToken = generateUserPricingToken();
  
      PricingContextImpl.setJwtExpirationTime(86400000);
  
      (mockRequest.header as jest.Mock).mockReturnValue(testToken);
  
      jest.advanceTimersByTime(2);

      const middleware = checkFeature('pets');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.header).toHaveBeenCalledWith('Pricing-Token');
      expect(sendMock).toHaveBeenCalledWith('Pricing token expired');
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 if user have no access allowed to the requested feature', () => {
      
      const testToken = generateUserPricingToken();
  
      (mockRequest.header as jest.Mock).mockReturnValue(testToken);
  
      const middleware = checkFeature('consultations');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.header).toHaveBeenCalledWith('Pricing-Token');
      expect(sendMock).toHaveBeenCalledWith('Access to this feature is restricted. Please upgrade your plan to gain access.');
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
      
    });
  });

  describe('Positive tests of checkFeature middleware with PricingContextImpl', () => {
    it('request should be processed if a valid Pricing-Token with required permissions for the requested feature is provided', () => {
      const testToken = generateUserPricingToken();
      
      (mockRequest.header as jest.Mock).mockReturnValue(testToken);
  
      const middleware = checkFeature('pets');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
  
      expect(mockRequest.header).toHaveBeenCalledWith('Pricing-Token');
      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });
  })
});