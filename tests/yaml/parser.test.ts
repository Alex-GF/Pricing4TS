import { retrievePricingFromPath } from '../../src/server/utils/yaml-utils';
import { Pricing } from '../../src/types';
import assert from 'assert';
import { LATEST_PRICING2YAML_VERSION } from '../../src/server/utils/version-manager';
import { v4 as uuidv4 } from 'uuid';
import { parseCSVContent, readCSVFile } from '../utils/csv-utils';
import fs from 'fs';

const POSITIVE_TESTS_CSV_PATH = 'tests/yaml/data/positive-parsing-tests.csv';
const NEGATIVE_TESTS_CSV_PATH = 'tests/yaml/data/negative-parsing-tests.csv';
const suiteUUID = uuidv4();
const TEMP_FILE_PATH = `tests/resources/temp-${suiteUUID}/test_`;
const TEMP_DIR = `tests/resources/temp-${suiteUUID}/`;

const positiveTestsParameters = parseCSVContent(readCSVFile(POSITIVE_TESTS_CSV_PATH));
const negativeTestsParameters = parseCSVContent(readCSVFile(NEGATIVE_TESTS_CSV_PATH));

describe('Positive Pricing2Yaml Parser Tests', () => {
  beforeAll(() => {
    fs.mkdirSync(TEMP_DIR);
  });

  afterAll(() => {
    fs.rmdirSync(TEMP_DIR, { recursive: true });
  });

  for (const { sectionName, tests } of positiveTestsParameters) {
    describe(sectionName, () => {
      for (const { pricingPath, expected } of tests) {
        const tempPricingPath = TEMP_FILE_PATH + pricingPath.split('/').pop();

        beforeEach(() => {
          // Create a temp file from the TEST_PRICING_YAML_PATH file
          fs.copyFileSync(pricingPath, tempPricingPath);
        });

        it(`${expected} parsing`, () => {
          const pricing: Pricing = retrievePricingFromPath(tempPricingPath);

          assert.equal(pricing.saasName, expected);
          assert.equal(pricing.syntaxVersion, LATEST_PRICING2YAML_VERSION);
          assert(pricing.createdAt instanceof Date);
        });
      }
    });
  }
});

describe('Subscription Contraints Parser Tests', () => {
  beforeAll(() => {
    fs.mkdirSync(TEMP_DIR);
  });

  afterAll(() => {
    fs.rmdirSync(TEMP_DIR, { recursive: true });
  });

  it ("Given scalable add-on with subscription constraints should parse", () => {
    const pricingPath = 'tests/resources/pricing/positive/addOn/scalable-subscriptionConstraints.yml';
    const tempPricingPath = TEMP_FILE_PATH + pricingPath.split('/').pop();
    fs.copyFileSync(pricingPath, tempPricingPath);

    const pricing: Pricing = retrievePricingFromPath(tempPricingPath);
    assert.equal(pricing.addOns!['addon1'].subscriptionConstraints.minQuantity, 2);
    assert.equal(pricing.addOns!['addon1'].subscriptionConstraints.maxQuantity, 10);
    assert.equal(pricing.addOns!['addon1'].subscriptionConstraints.quantityStep, 2);
  })

  it ("Given scalable add-on with no subscription constraints should parse", () => {
    const pricingPath = 'tests/resources/pricing/positive/addOn/scalable-no-subscriptionConstraints.yml';
    const tempPricingPath = TEMP_FILE_PATH + pricingPath.split('/').pop();
    fs.copyFileSync(pricingPath, tempPricingPath);

    const pricing: Pricing = retrievePricingFromPath(tempPricingPath);
    assert.equal(pricing.addOns!['addon1'].subscriptionConstraints.minQuantity, 1);
    assert.equal(pricing.addOns!['addon1'].subscriptionConstraints.maxQuantity, 100000000);
    assert.equal(pricing.addOns!['addon1'].subscriptionConstraints.quantityStep, 1);
  })

  it ("Given non-scalable add-on with no subscription constraints should parse", () => {
    const pricingPath = 'tests/resources/pricing/positive/addOn/no-scalable-no-subscriptionContraints.yml';
    const tempPricingPath = TEMP_FILE_PATH + pricingPath.split('/').pop();
    fs.copyFileSync(pricingPath, tempPricingPath);

    const pricing: Pricing = retrievePricingFromPath(tempPricingPath);
    assert.equal(pricing.addOns!['addon1'].subscriptionConstraints, undefined);
  })
});

describe('Trackable Usage Limits Parser Tests', () => {
  beforeAll(() => {
    fs.mkdirSync(TEMP_DIR);
  });

  afterAll(() => {
    fs.rmdirSync(TEMP_DIR, { recursive: true });
  });

  it ("Given non renewable, trackable usage limit without trackable field should parse", () => {
    const pricingPath = 'tests/resources/pricing/positive/usageLimit/non-renewable-no-trackable.yml';
    const tempPricingPath = TEMP_FILE_PATH + pricingPath.split('/').pop();
    fs.copyFileSync(pricingPath, tempPricingPath);

    const pricing: Pricing = retrievePricingFromPath(tempPricingPath);
    assert.equal(pricing.usageLimits!['usageLimit1'].trackable, false);
    assert.equal(pricing.usageLimits!['usageLimit1'].period, undefined);
  })

  it ("Given non renewable, trackable usage limit with trackable field should parse", () => {
    const pricingPath = 'tests/resources/pricing/positive/usageLimit/non-renewable-trackable.yml';
    const tempPricingPath = TEMP_FILE_PATH + pricingPath.split('/').pop();
    fs.copyFileSync(pricingPath, tempPricingPath);

    const pricing: Pricing = retrievePricingFromPath(tempPricingPath);
    assert.equal(pricing.usageLimits!['usageLimit1'].trackable, true);
    assert.equal(pricing.usageLimits!['usageLimit1'].period, undefined);
  })

  it ("Given renewable usage limit with period field should parse", () => {
    const pricingPath = 'tests/resources/pricing/positive/usageLimit/renewable-period.yml';
    const tempPricingPath = TEMP_FILE_PATH + pricingPath.split('/').pop();
    fs.copyFileSync(pricingPath, tempPricingPath);

    const pricing: Pricing = retrievePricingFromPath(tempPricingPath);
    assert.equal(pricing.usageLimits!['usageLimit1'].period!.unit, "DAY");
    assert.equal(pricing.usageLimits!['usageLimit1'].period!.value, 28);
    assert.equal(pricing.usageLimits!['usageLimit1'].trackable, undefined);
  })

  it ("Given renewable usage limit without period field should parse", () => {
    const pricingPath = 'tests/resources/pricing/positive/usageLimit/renewable-no-period.yml';
    const tempPricingPath = TEMP_FILE_PATH + pricingPath.split('/').pop();
    fs.copyFileSync(pricingPath, tempPricingPath);

    const pricing: Pricing = retrievePricingFromPath(tempPricingPath);
    assert.equal(pricing.usageLimits!['usageLimit1'].period!.unit, "MONTH");
    assert.equal(pricing.usageLimits!['usageLimit1'].period!.value, 1);
    assert.equal(pricing.usageLimits!['usageLimit1'].trackable, undefined);
  })
});

describe('Negative Pricing2Yaml Parser Tests', () => {
  beforeAll(() => {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  });

  afterAll(() => {
    fs.rmdirSync(TEMP_DIR, { recursive: true });
  });

  for (const { sectionName, tests } of negativeTestsParameters) {
    describe(sectionName, () => {
      for (const { testName, pricingPath, expected } of tests) {
        const tempPricingPath = TEMP_FILE_PATH + pricingPath.split('/').pop();

        beforeEach(() => {
          // Create a temp file from the TEST_PRICING_YAML_PATH file
          fs.copyFileSync(pricingPath, tempPricingPath);
        });

        it(`${testName}`, () => {
          try {
            const _pricing: Pricing = retrievePricingFromPath(tempPricingPath);
            assert(false, 'Expected an error to be thrown');
          } catch (error) {
            assert.equal((error as Error).message, expected);
          }
        });
      }
    });
  }
});
