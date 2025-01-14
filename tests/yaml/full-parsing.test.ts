import assert from 'assert';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Pricing } from '../../src/types';
import { LATEST_PRICING2YAML_VERSION } from '../../src/server/utils/version-manager';
import { retrievePricingFromYaml } from '../../src/main/utils/yaml-utils';
import { retrievePricingFromPath } from '../../src/server/utils/yaml-utils';

const DEMO_SAAS_PATH = 'tests/resources/pricing/full/petclinic.yml';
const DEMO_SAAS_NAME = 'PetClinic';
const suiteUUID = uuidv4();
const TEMP_FILE_PATH = `tests/resources/temp-${suiteUUID}/test_`;
const TEMP_DIR = `tests/resources/temp-${suiteUUID}/`;

describe('Demo SaaS Parsing Tests', () => {
  beforeAll(() => {
    fs.mkdirSync(TEMP_DIR);
  });

  afterAll(() => {
    fs.rmdirSync(TEMP_DIR, { recursive: true });
  });

  const tempPricingPath = TEMP_FILE_PATH + DEMO_SAAS_PATH.split('/').pop();

  beforeEach(() => {
    // Create a temp file from the TEST_PRICING_YAML_PATH file
    fs.copyFileSync(DEMO_SAAS_PATH, tempPricingPath);
  });

  it(DEMO_SAAS_NAME, () => {
    const pricing: Pricing = retrievePricingFromPath(tempPricingPath);

    assert.equal(pricing.saasName, DEMO_SAAS_NAME);
    // Asserts all global attributes exist
    assert(
      pricing.syntaxVersion === LATEST_PRICING2YAML_VERSION,
      'The pricing version must match the latest version'
    );
    assert(
      pricing.createdAt instanceof Date,
      "The pricing must have a non-empty Date 'createdAt' attribute"
    );
    assert(pricing.currency, "The pricing must have a non-empty string 'currency' attribute");
    // Asserts that at least one feature, usage limit, plan, and add-on exists in the pricing object
    assert(
      Object.values(pricing.features).length > 0,
      'The pricing must contain at least one feature in order to test the functionality'
    );
    assert(
      Object.values(pricing.usageLimits!).length > 0,
      'The pricing must contain at least one usage limit in order to test the functionality'
    );
    assert(
      pricing.plans ? Object.values(pricing.plans!).length > 0 : true,
      'The pricing must contain at least one plan in order to test the functionality'
    );
    assert(
      Object.values(pricing.addOns!).length > 0,
      'The pricing must contain at least one add-on in order to test the functionality'
    );
    // Assert that at least one addon depends on at least one other add-on
    assert(
      Object.values(pricing.addOns!).some(a => a.dependsOn!.length > 0),
      'At least one addon of the pricing must depend on another in order to test the functionality'
    );
    // Assert that all plans contains all features
    assert(
      pricing.plans
        ? Object.values(pricing.plans!).every(p => Object.keys(p.features).length === Object.values(pricing.features).length)
        : true,
      'Not all plans contains all features'
    );
    // Assert that all plans contains all usage limits
    assert(
      pricing.plans
        ? Object.values(pricing.plans!).every(
            p => Object.keys(p.usageLimits!).length === Object.values(pricing.usageLimits!).length
          )
        : true,
      'Not all plans contains all usage limits'
    );

    assert(
      Array.isArray(pricing.tags),
      "The pricing must have a 'tags' attribute as an array of strings"
    );

    Object.values(pricing.features).forEach(feature => {
      if (feature.tag) {
        assert(
          pricing.tags!.includes(feature.tag),
          `Feature tag '${feature.tag}' must be one of the values defined in 'tags'`
        );
      }
    });
  });
  it(DEMO_SAAS_NAME, () => {
    const fileContent = fs.readFileSync(tempPricingPath, 'utf-8');

    const pricing: Pricing = retrievePricingFromYaml(fileContent);

    assert.equal(pricing.saasName, DEMO_SAAS_NAME);
    // Asserts all global attributes exist
    assert(
      pricing.syntaxVersion === LATEST_PRICING2YAML_VERSION,
      'The pricing version must match the latest version'
    );
    assert(
      pricing.createdAt instanceof Date,
      "The pricing must have a non-empty Date 'createdAt' attribute"
    );
    assert(pricing.currency, "The pricing must have a non-empty string 'currency' attribute");
    // Asserts that at least one feature, usage limit, plan, and add-on exists in the pricing object
    assert(
      Object.values(pricing.features).length > 0,
      'The pricing must contain at least one feature in order to test the functionality'
    );
    assert(
      Object.values(pricing.usageLimits!).length > 0,
      'The pricing must contain at least one usage limit in order to test the functionality'
    );
    assert(
      pricing.plans ? Object.values(pricing.plans!).length > 0 : true,
      'The pricing must contain at least one plan in order to test the functionality'
    );
    assert(
      Object.values(pricing.addOns!).length > 0,
      'The pricing must contain at least one add-on in order to test the functionality'
    );
    // Assert that at least one addon depends on at least one other add-on
    assert(
      Object.values(pricing.addOns!).some(a => a.dependsOn!.length > 0),
      'At least one addon of the pricing must depend on another in order to test the functionality'
    );
    // Assert that all plans contains all features
    assert(
      pricing.plans
        ? Object.values(pricing.plans!).every(p => Object.keys(p.features).length === Object.values(pricing.features).length)
        : true,
      'Not all plans contains all features'
    );
    // Assert that all plans contains all usage limits
    assert(
      pricing.plans
        ? Object.values(pricing.plans!).every(
            p => Object.keys(p.usageLimits!).length === Object.values(pricing.usageLimits!).length
          )
        : true,
      'Not all plans contains all usage limits'
    );

    assert(
      Array.isArray(pricing.tags),
      "The pricing must have a 'tags' attribute as an array of strings"
    );

    Object.values(pricing.features).forEach(feature => {
      if (feature.tag) {
        assert(
          pricing.tags!.includes(feature.tag),
          `Feature tag '${feature.tag}' must be one of the values defined in 'tags'`
        );
      }
    });
  });
});
