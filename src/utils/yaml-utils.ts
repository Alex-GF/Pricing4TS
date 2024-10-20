import yaml from "js-yaml";
import { Pricing, ExtractedPricing } from "../models/pricing.ts";
import { formatPricing } from "./pricing-formatter.ts";
import { update } from "./version-manager.ts";

export function retrievePricingFromYaml(yamlPath: string): Pricing {

    const absolutePath: string = Deno.realPathSync(yamlPath);
    let fileContent: string;

    try {
        fileContent = Deno.readTextFileSync(absolutePath);
    } catch (_error) {
        throw new Error(`The file at path ${yamlPath} could not be found. Please check that the path is correct and that the file exists.`);
    }

    const extractedPricing: ExtractedPricing = yaml.load(fileContent);

    if (extractedPricing === null || extractedPricing === undefined) {
        throw new Error(`The file at path ${yamlPath} does not contain valid YAML content.`);
    }

    update(extractedPricing, absolutePath);

    const pricing: Pricing = formatPricing(extractedPricing);
    
    return pricing;
}

export function writePricingToYaml(pricing: Pricing, yamlPath: string): void {
    
    try{
        const absolutePath: string = Deno.realPathSync(yamlPath);
        const yamlString: string = yaml.dump(pricing);
        Deno.writeTextFileSync(absolutePath, yamlString);
    }catch(_error){
        throw new Error(`Failed to write the file at path ${yamlPath}. Please check that the path is correct and that the file exists.`);
    }
}

export function writePricingWithErrorToYaml(pricing: any, yamlPath: string): void {
    try{
        const absolutePath: string = Deno.realPathSync(yamlPath);
        const yamlString: string = yaml.dump(pricing);
        Deno.writeTextFileSync(absolutePath, yamlString);
    }catch(_error){
        throw new Error(`Failed to write the file at path ${yamlPath}. Please check that the path is correct and that the file exists.`);
    }
}