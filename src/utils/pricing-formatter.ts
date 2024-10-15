import { Pricing, ExtractedPricing, generateEmptyPricing } from '../models/pricing.ts';
import { validateName, validateVersion, validateCreatedAt } from './pricing-validators.ts';

export function formatPricing(extractedPricing: ExtractedPricing): Pricing {

    const pricing: Pricing = generateEmptyPricing();
    
    pricing.version = validateVersion(extractedPricing.version); // Assumes that the version has been processed to be the last one
    pricing.saasName = formatSaaSName(validateName(extractedPricing.saasName, "SaaS"));
    pricing.createdAt = validateCreatedAt(extractedPricing.createdAt);

    return pricing;
}

// --------- PRICING FIELDS FORMATTERS ---------

function formatSaaSName(saasName: string): string {
    return saasName.trim();
}