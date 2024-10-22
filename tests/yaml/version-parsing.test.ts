import { retrievePricingFromYaml } from "../../src/utils/yaml-utils";
import { Pricing } from "../../src/models/pricing";
import assert from "assert";
import { readCSVFile, parseCSVContent } from "../utils/csv-utils";
import {v4 as uuidv4 } from "uuid";
import fs from "fs";

const OLD_VERSION_SAAS_CSV_PATH = "tests/yaml/data/version-parsing-tests.csv";
const suiteUUID = uuidv4();
const TEMP_FILE_PATH = `tests/resources/temp-${suiteUUID}/test_`;
const TEMP_DIR = `tests/resources/temp-${suiteUUID}/`;

const oldVersionSaaSParameters = parseCSVContent(readCSVFile(OLD_VERSION_SAAS_CSV_PATH));

describe("Demo SaaS Parsing Tests", () => {

    beforeAll(() => {
        fs.mkdirSync(TEMP_DIR);
    })

    afterAll(() => {
        fs.rmdirSync(TEMP_DIR, {recursive: true});
    })

    for (const {sectionName, tests} of oldVersionSaaSParameters){
        describe(sectionName, () => {
            for (const {pricingPath, expected} of tests) {

                const tempPricingPath = TEMP_FILE_PATH + pricingPath.split("/").pop();

                beforeEach(() => {
                    // Create a temp file from the TEST_PRICING_YAML_PATH file
                    fs.copyFileSync(pricingPath, tempPricingPath);
                });
            
                it(`${expected}`, () => {
                    const pricing: Pricing = retrievePricingFromYaml(tempPricingPath);
    
                    assert.equal(pricing.saasName, expected);
                });
            }}
        );
    }
});