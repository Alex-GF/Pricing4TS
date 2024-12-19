import yaml from 'js-yaml';
import { Pricing, ExtractedPricing } from '../models/pricing2yaml/pricing';
import { parsePricing } from './pricing-formatting/pricing-parser';

export function retrievePricingFromYaml(strigifiedYaml: string): Pricing {
  const extractedPricing: ExtractedPricing = yaml.load(strigifiedYaml) as ExtractedPricing;

  const pricing: Pricing = parsePricing(extractedPricing);

  return pricing;
}