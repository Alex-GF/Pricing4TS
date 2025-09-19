import yaml from 'js-yaml';
import fs from 'fs';
import { Pricing, ExtractedPricing, PricingToBeWritten } from '../../main/models/pricing2yaml/pricing';
import { parsePricing } from '../../main/utils/pricing-formatting/pricing-parser';
import { update } from './version-manager';
import { serializePricing } from '../../main/utils/pricing-formatting/pricing-serializer';

export function retrievePricingFromPath(yamlPath: string): Pricing {
  const absolutePath: string = fs.realpathSync(yamlPath);
  let fileContent: string;

  try {
    fileContent = fs.readFileSync(absolutePath, 'utf-8');
  } catch (_error) {
    throw new Error(
      `The file at path ${yamlPath} could not be found. Please check that the path is correct and that the file exists.`
    );
  }

  const pricing: Pricing = retrievePricingFromText(fileContent, yamlPath);

  return pricing;
}

export function retrievePricingFromText(stringifiedPricing: string, yamlPath?: string): Pricing{
  const extractedPricing: ExtractedPricing = yaml.load(stringifiedPricing) as ExtractedPricing;

  if (extractedPricing === null || extractedPricing === undefined && yamlPath) {
    throw new Error(`The file at path ${yamlPath} does not contain valid YAML content.`);
  }

  if (yamlPath) {
    const absolutePath: string = fs.realpathSync(yamlPath);
    update(extractedPricing, true, absolutePath);
  }else{
    update(extractedPricing, false);
  }

  const pricing: Pricing = parsePricing(extractedPricing);

  return pricing;
}

export function writePricingToYaml(pricing: Pricing, yamlPath: string): void {
  try {
    const absolutePath: string = fs.realpathSync(yamlPath);
    const pricingToBeWritten: PricingToBeWritten = serializePricing(pricing);
    const yamlString: string = yaml.dump(pricingToBeWritten);
    fs.writeFileSync(absolutePath, yamlString);
  } catch (_error) {
    console.log(_error);
    throw new Error(
      `Failed to write the file at path ${yamlPath}. Please check that the path is correct and that the file exists.`
    );
  }
}

export function writePricingWithErrorToYaml(pricing: any, yamlPath: string): void {
  try {
    const absolutePath: string = fs.realpathSync(yamlPath);
    const pricingToBeWritten: PricingToBeWritten = serializePricing(pricing);
    const yamlString: string = yaml.dump(pricingToBeWritten);
    fs.writeFileSync(absolutePath, yamlString);
  } catch (_error) {
    throw new Error(
      `Failed to write the file at path '${yamlPath}' after failing in the version update process. Please check that the path is correct and that the file exists. Received pricing: \n ${pricing}`
    );
  }
}
