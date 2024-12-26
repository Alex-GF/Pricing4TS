import { Request, Response, NextFunction } from 'express';
import { checkFeature } from '../../src/server/middleware/feature-checker';
import { PricingContext } from '../../src/server/configuration/PricingContext';
import { PricingContextManager } from '../../src/server/server';
import { generateUserToken } from '../../src/server/utils/pricing-evaluator';

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
  });

  beforeAll(() => {
    const pricingContext: PricingContext = new PricingContextImpl();

    PricingContextManager.registerContext(pricingContext);
  });

  it('should return 401 if Pricing-Token header is not provided', () => {
    (mockRequest.header as jest.Mock).mockReturnValue(null);

    checkFeature(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.header).toHaveBeenCalledWith('Pricing-Token');
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(sendMock).toHaveBeenCalledWith('Pricing token not found');
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should decode the token if Pricing-Token is provided', () => {
    const testToken = generateUserToken();
    
    (mockRequest.header as jest.Mock).mockReturnValue(testToken);

    checkFeature(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.header).toHaveBeenCalledWith('Pricing-Token');
    expect(nextFunction).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
  });

  it('should throw an error when decoding a token with passed expiration time', () => {
    
    PricingContextImpl.setJwtExpirationTime(1);
    
    const testToken = generateUserToken();

    PricingContextImpl.setJwtExpirationTime(86400000);

    (mockRequest.header as jest.Mock).mockReturnValue(testToken);

    setTimeout(() => {
        checkFeature(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockRequest.header).toHaveBeenCalledWith('Pricing-Token');
        expect(sendMock).toHaveBeenCalledWith('Pricing token expired');
        expect(statusMock).toHaveBeenCalledWith(401);
        expect(nextFunction).not.toHaveBeenCalled();
    }, 2);
  });
});
