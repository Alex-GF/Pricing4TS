import { Request, Response, NextFunction } from 'express';
import {encode, decode} from 'jwt-simple';
import { PricingContext } from '../configuration/PricingContext';
import { PricingContextManager } from '../server';
import { Pricing } from '../../main';

export function checkFeature(req: Request, res: Response, next: NextFunction){
    const pricingToken = req.header('Pricing-Token');
    const pricingContext: PricingContext = PricingContextManager.getContext();

    if (pricingToken === undefined || pricingToken === null){
        return res.status(401).send("Pricing token not found");
    }else{
        const decodedToken = decode(pricingToken, pricingContext.getJwtSecret());
    }
    next();
}

export function createPricingToken(req: Request, res: Response, next: NextFunction) {
    const pricingContext: PricingContext = PricingContextManager.getContext();
    const payload = {
        timestamp: new Date().getTime()
    };
    const token = encode(payload, pricingContext.getJwtSecret());

    // Store the original send function
    const originalSend = res.send;

    // Override the send function to add the header before sending the response
    res.send = function (body?: any) {
        res.setHeader('Pricing-Token', token);
        return originalSend.call(this, body);
    };

    next();
}