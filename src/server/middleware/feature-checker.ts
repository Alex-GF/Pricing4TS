import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { PricingJwtUtils } from '../utils/pricing-jwt-utils';

export function checkFeature(feature: string): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        const pricingToken = req.header('Pricing-Token');
    
        try{
            const decodedToken = PricingJwtUtils.decodeToken(pricingToken);

            if(!decodedToken){
                res.status(401).send('Invalid token');
            } else if(!decodedToken.features[feature].eval){
                res.status(403).send('Access to this feature is restricted. Please upgrade your plan to gain access.');
            } else {
                next();
            }
        }catch(e){
            res.status(401).send((e as Error).message);
        }
    }
}
