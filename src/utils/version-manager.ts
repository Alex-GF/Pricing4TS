// deno-lint-ignore-file no-explicit-any
import * as semver from "@std/semver";
import { validateVersion } from "./pricing-validators.ts";
import { updaters } from "./version-updaters/updaters.ts";
import { writePricingWithErrorToYaml } from "./yaml-utils.ts";
import { writePricingToYaml } from "./yaml-utils.ts";

export const PRICING2YAML_VERSIONS: Array<string> = ["1.0", "1.1", "2.0"];

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
export function update(extractedPricing: any, pricingPath: string): any {
  const pricingVersion = _parseToSemver(
    validateVersion(extractedPricing.version)
  );
  const latestVersion = _parseToSemver(LATEST_PRICING2YAML_VERSION);
  if (!semver.equals(pricingVersion, latestVersion)) {
    if (PRICING2YAML_VERSIONS.includes(extractedPricing.version)) {
      _performUpdate(extractedPricing, pricingPath);
    } else {
      throw new Error(
        `Unsupported version: ${pricingVersion.major}.${pricingVersion.minor}. Please, visit the changelogs of Pricing2Yaml to check the supported versions.`
      );
    }
  } else if (semver.greaterThan(pricingVersion, latestVersion)) {
    throw new Error(
      `Wow! You have travelled to the future! This version of Pricing2Yaml is greater than the latest version available: ${LATEST_PRICING2YAML_VERSION}`
    );
  }

  return extractedPricing;
}

function _performUpdate(extractedPricing: any, pricingPath: string): void {
  const currentVersion = extractedPricing.version;
  const nextVersion = calculateNextVersion(currentVersion);

  const updater = updaters[extractedPricing.version];

  if (updater === null) {
    writePricingToYaml(extractedPricing, pricingPath);
    return;
  } else {
    let updatedPricing = null;
    try {
      updatedPricing = updater(extractedPricing);
    } catch (err) {
      writePricingWithErrorToYaml(extractedPricing, pricingPath);
      throw new Error(
        `An error occurred while updating from version ${currentVersion} to ${nextVersion}. Your Pricing2Yaml model has been saved at version ${currentVersion}. Please resolve the issues and try again. Error details: ${(err as Error).message}.`
      );
    }
    _performUpdate(updatedPricing, pricingPath);
  }
}

function _parseToSemver(version: string): semver.SemVer {
  return semver.parse(validateVersion(version) + ".0");
}
