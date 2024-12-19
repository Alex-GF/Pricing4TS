import { Request, Response, NextFunction } from 'express';
import {encode, decode} from 'jwt-simple';
import { PricingContext } from '../configuration/PricingContext';

class PricingContextImpl extends PricingContext{
    getConfigFilePath(): string {
        return "pricing.yaml";
    }
    getJwtSecret(): string {
        return "secret";
    }
    getUserContext(): Record<string, boolean | string | number> {
        return {
            "user": "test",
            "email": "test"
        }
    }
    getUserPlan(): string {
        return "test";
    }
}

export function checkFeature(req: Request, res: Response, next: NextFunction){
    const pricingToken = req.header('Pricing-Token');
    const pricingContext: PricingContext = new PricingContextImpl();

    if (pricingToken === undefined || pricingToken === null){
        return res.status(401).send("Pricing token not found");
    }else{
        const decodedToken = decode(pricingToken, pricingContext.getJwtSecret());
    }
}