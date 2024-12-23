import { Request, Response, NextFunction } from 'express';
import { checkFeature } from '../../src/server/middleware/feature-checker';
import { PricingContext } from '../../src/server/configuration/PricingContext';
import { decode } from 'jwt-simple';
import { PricingContextManager } from '../../src/server/server';
import { Pricing } from '../../src/main';

export class PricingContextImpl extends PricingContext {
    getConfigFilePath(): string {
        return "tests/resources/pricing/real/box/2024.yml";
    }

    getJwtSecret(): string {
        return "secret";
    }

    getUserContext(): Record<string, boolean | string | number> {
        return {
            userId: 123,
            isAdmin: true,
        };
    }

    getUserPlan(): string {
        return 'ENTERPRISE_PLUS';
    }
}

// Mock de la función decode
jest.mock('jwt-simple', () => ({
    decode: jest.fn(),
}));

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

        checkFeature(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(mockRequest.header).toHaveBeenCalledWith('Pricing-Token');
        expect(statusMock).toHaveBeenCalledWith(401);
        expect(sendMock).toHaveBeenCalledWith('Pricing token not found');
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should decode the token if Pricing-Token is provided', () => {
        const mockToken = 'mock-token';
        const mockDecoded = { someKey: 'someValue' };

        (mockRequest.header as jest.Mock).mockReturnValue(mockToken);
        (decode as jest.Mock).mockReturnValue(mockDecoded);

        checkFeature(
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(mockRequest.header).toHaveBeenCalledWith('Pricing-Token');
        expect(decode).toHaveBeenCalledWith(mockToken, PricingContextManager.getContext().getJwtSecret());
        expect(nextFunction).toHaveBeenCalled();
        expect(statusMock).not.toHaveBeenCalled();
    });
});