import assert from 'assert';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Pricing } from '../../src/types';
import { LATEST_PRICING2YAML_VERSION } from '../../src/server/utils/version-manager';
import { retrievePricingFromPath } from '../../src/server/utils/yaml-utils';
import { parseCSVContent, readCSVFile } from '../utils/csv-utils';

const TESTS_CSV_PATH = 'tests/yaml/data/full-parsing-tests.csv';
const suiteUUID = uuidv4();
const TEMP_FILE_PATH = `tests/resources/temp-${suiteUUID}/test_`;
const TEMP_DIR = `tests/resources/temp-${suiteUUID}/`;

const fullTestsParameters = parseCSVContent(readCSVFile(TESTS_CSV_PATH));

describe('Full Pricings Pricing2Yaml Parser Tests', () => {
  beforeAll(() => {
    fs.mkdirSync(TEMP_DIR);
  });

  afterAll(() => {
    fs.rmdirSync(TEMP_DIR, { recursive: true });
  });

  for (const { sectionName, tests } of fullTestsParameters) {
    describe(sectionName, () => {
      for (const { pricingPath, expected } of tests) {
        const tempPricingPath = TEMP_FILE_PATH + pricingPath.split('/').pop();

        beforeEach(() => {
          // Create a temp file from the TEST_PRICING_YAML_PATH file
          fs.copyFileSync(pricingPath, tempPricingPath);
        });

        it(`${expected} parsing`, () => {
          const pricing: Pricing = retrievePricingFromPath(tempPricingPath);

          assert.equal(pricing.saasName.split(" ")[0].toLowerCase(), expected.toLowerCase());
          assert.equal(pricing.syntaxVersion, LATEST_PRICING2YAML_VERSION);
          assert(pricing.createdAt instanceof Date);
        });
      }
    });
  }
});