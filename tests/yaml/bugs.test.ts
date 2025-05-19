/**
 * Tests for bugs that have been detected and fixed in the Pricing4TS library.
 *
 * This file contains regression tests to ensure that previously identified bugs
 * remain fixed in future library versions.
 *
 * @file
 */

import { retrievePricingFromPath } from '../../src/server/utils/yaml-utils';
import { Pricing } from '../../src/types';
import assert from 'assert';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const suiteUUID = uuidv4();
const TEMP_FILE_PATH = `tests/resources/temp-${suiteUUID}/test_`;
const TEMP_DIR = `tests/resources/temp-${suiteUUID}/`;

function createTempVersion(pricingPath: string): string {
  const tempPricingPath = TEMP_FILE_PATH + pricingPath.split('/').pop();
  // Create a temp file from the TEST_PRICING_YAML_PATH file
  fs.copyFileSync(pricingPath, tempPricingPath);
  return tempPricingPath;
}

describe('Bug Tests', () => {
  beforeAll(() => {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  });

  afterAll(() => {
    fs.rmdirSync(TEMP_DIR, { recursive: true });
  });

  it('Non-empty add-ons detected as empty due to population of features, usageLimits and usageLimitsExtensions as {} instead of null', () => {
    const pricingPath = 'tests/resources/pricing/bugs/valid-addon-detected-as-empty.yaml';
    const tempPricingPath = createTempVersion(pricingPath);

    try {
      const pricing: Pricing = retrievePricingFromPath(tempPricingPath);
      assert.equal(pricing.saasName, 'seal');
    } catch (error) {
      assert.fail('Error while parsing the pricing file: ' + error);
    }
  });
});
