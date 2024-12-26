import { Request, Response, NextFunction } from 'express';
import { PricingContext } from '../configuration/PricingContext';
import { PricingContextManager } from '../server';
import { PricingJwtUtils } from '../utils/pricing-jwt-utils';

export function checkFeature(req: Request, res: Response, next: NextFunction){
    const pricingToken = req.header('Pricing-Token');

    try{
        const decodedToken = PricingJwtUtils.decodeToken(pricingToken);
    }catch(e){
        return res.status(401).send((e as Error).message);
    }

    next();
}

export function createPricingToken(req: Request, res: Response, next: NextFunction) {
    const pricingContext: PricingContext = PricingContextManager.getContext();
    const payload = {
        sub: pricingContext.getUserContext().username ?? pricingContext.getUserContext().user,
        userContext: pricingContext.getUserContext(),
    };
    const token = PricingJwtUtils.encodeToken(payload);

    // Store the original send function
    const originalSend = res.send;

    // Override the send function to add the header before sending the response
    res.send = function (body?: any) {
        res.setHeader('Pricing-Token', token);
        return originalSend.call(this, body);
    };

    next();
}