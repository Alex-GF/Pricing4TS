// deno-lint-ignore-file no-explicit-any
import semver from "semver";
import { validateSyntaxVersion } from "../../main/utils/pricing-validators";
import { updaters } from "./version-updaters/updaters";
import { writePricingWithErrorToYaml, writePricingToYaml } from "../../server/utils/yaml-utils";

export const PRICING2YAML_VERSIONS: Array<string> = ["1.0", "1.1", "2.0", "2.1", "3.0"];

export const LATEST_PRICING2YAML_VERSION: string =
  PRICING2YAML_VERSIONS[PRICING2YAML_VERSIONS.length - 1];

export function calculateNextVersion(currentVersion: string): string | null {
  const currentVersionIndex = PRICING2YAML_VERSIONS.indexOf(currentVersion);
  const nextVersion =
    currentVersionIndex === PRICING2YAML_VERSIONS.length - 1
      ? null
      : PRICING2YAML_VERSIONS[currentVersionIndex + 1];

  return nextVersion;
}
export function update(extractedPricing: any, useCheckpoints: boolean, pricingPath?: string): any {
  
  if (useCheckpoints && pricingPath === undefined) {
    throw new Error("Pricing path is required for version checking.");
  }
  
  const pricingVersion = _parseToSemver(
    validateSyntaxVersion(extractedPricing.syntaxVersion ?? extractedPricing.version)
  );
  const latestVersion = _parseToSemver(LATEST_PRICING2YAML_VERSION);
  if (!semver.eq(pricingVersion, latestVersion)) {
    if (PRICING2YAML_VERSIONS.includes(extractedPricing.syntaxVersion ?? extractedPricing.version)) {
      if (useCheckpoints) _performUpdate(extractedPricing, pricingPath);
      else _performUpdate(extractedPricing);
    } else {
      throw new Error(
        `Unsupported version: ${pricingVersion.major}.${pricingVersion.minor}. Please, visit the changelogs of Pricing2Yaml to check the supported versions.`
      );
    }
  } else if (semver.gt(pricingVersion, latestVersion)) {
    throw new Error(
      `Wow! You have travelled to the future! This version of Pricing2Yaml is greater than the latest version available: ${LATEST_PRICING2YAML_VERSION}`
    );
  }

  return extractedPricing;
}

function _performUpdate(extractedPricing: any, pricingPath?: string): void {
  const currentVersion = extractedPricing.syntaxVersion ?? extractedPricing.version;
  const nextVersion = calculateNextVersion(currentVersion);

  const updater = updaters[extractedPricing.syntaxVersion ?? extractedPricing.version];

  if (updater === null) {
    if (pricingPath !== undefined) writePricingToYaml(extractedPricing, pricingPath);
    return;
  } else {
    let updatedPricing = null;
    try {
      updatedPricing = updater(extractedPricing);
    } catch (err) {
      if (pricingPath !== undefined) writePricingWithErrorToYaml(extractedPricing, pricingPath);
      throw new Error(
        `An error occurred while updating from version ${currentVersion} to ${nextVersion}. Your Pricing2Yaml model has been saved at version ${currentVersion}. Please resolve the issues and try again. Error details: ${(err as Error).message}.`
      );
    }
    _performUpdate(updatedPricing, pricingPath);
  }
}

function _parseToSemver(version: string): semver.SemVer {
  const parsedVersion = semver.parse(version + ".0");
  
  if (parsedVersion === null) throw new Error(`Invalid version: ${version}`);
  
  return parsedVersion;
}