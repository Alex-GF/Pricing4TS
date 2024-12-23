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

export function updatePricingJwt(req: Request, res: Response, next: NextFunction){
    next();
    const pricingContext: PricingContext = PricingContextManager.getContext();
    const pricing: Pricing = pricingContext.getPricing();
    const pricingToken = encode(pricing, pricingContext.getJwtSecret());
    res.setHeader('Pricing-Token', pricingToken);
}