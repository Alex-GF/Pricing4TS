import * as jwt from 'jwt-simple';
import { PricingContext } from '../configuration/PricingContext';
import { PricingContextManager } from '../server';
import { FeatureStatus } from './pricing-evaluator';

export function getFeaturesFromJwtToken(token: string): Record<string, FeatureStatus> {
    const pricingContext: PricingContext = PricingContextManager.getContext();
    
    const decodedToken: Record<string, any> = jwt.decode(token, pricingContext.getJwtSecret());
    const tokenFeatures: Record<string, FeatureStatus> = decodedToken.features;
    
    return tokenFeatures;
}

export function getSubjectFromJwtToken(token: string): string{
    const pricingContext: PricingContext = PricingContextManager.getContext();
    
    const decodedToken: Record<string, any> = jwt.decode(token, pricingContext.getJwtSecret());
    const tokenSubject: string = decodedToken.sub;
    
    return tokenSubject;
}

export function updateTokenFeatures(oldToken: string, newFeatureStatuses: Record<string, FeatureStatus>): string{
    const pricingContext: PricingContext = PricingContextManager.getContext();
    
    const decodedToken: Record<string, any> = jwt.decode(oldToken, pricingContext.getJwtSecret());
    decodedToken.features = newFeatureStatuses;
    
    return jwt.encode(decodedToken, pricingContext.getJwtSecret());
}