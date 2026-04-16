import { retrievePricingFromPath } from '../../src/server/utils/yaml-utils';
import assert from 'assert';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const suiteUUID = uuidv4();
const TEMP_FILE_PATH = `tests/resources/temp-${suiteUUID}/test_`;
const TEMP_DIR = `tests/resources/temp-${suiteUUID}/`;

describe('Variables parsing tests', () => {
  beforeAll(() => {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  });

  afterAll(() => {
    fs.rmdirSync(TEMP_DIR, { recursive: true });
  });

  it('Prices with boolean and numeric variables evaluate correctly', () => {
    const pricingPath = 'tests/resources/pricing/positive/variables/pricing-with-variables.yml';
    const tempPricingPath = TEMP_FILE_PATH + pricingPath.split('/').pop();
    fs.copyFileSync(pricingPath, tempPricingPath);

    const pricing = retrievePricingFromPath(tempPricingPath);

    // BASIC price: '#vip ? #x : 0.0' with vip=true and x=5 => 5
    assert.equal(pricing.plans!['BASIC'].price, 5);
    // PRO price unchanged
    assert.equal(pricing.plans!['PRO'].price, 15.99);
  });
  
  it('Prices with list variables evaluate correctly', () => {
    const pricingPath = 'tests/resources/pricing/positive/variables/pricing-with-variables-with-list.yml';
    const tempPricingPath = TEMP_FILE_PATH + pricingPath.split('/').pop();
    fs.copyFileSync(pricingPath, tempPricingPath);

    const pricing = retrievePricingFromPath(tempPricingPath);

    // BASIC price: '#test[0] ? #value[0] : #value[1]' with test[0]=true and value[0]=5 => 5
    assert.equal(pricing.plans!['BASIC'].price, 5);
    // PRO price unchanged
    assert.equal(pricing.plans!['PRO'].price, 15.99);
  });
  
  it('Prices with object variables evaluate correctly', () => {
    const pricingPath = 'tests/resources/pricing/positive/variables/pricing-with-variables-with-object.yml';
    const tempPricingPath = TEMP_FILE_PATH + pricingPath.split('/').pop();
    fs.copyFileSync(pricingPath, tempPricingPath);

    const pricing = retrievePricingFromPath(tempPricingPath);

    // BASIC price: '#test.nested ? #value[0] : #value[1]' with test.nested=true and value[0]=5 => 5
    assert.equal(pricing.plans!['BASIC'].price, 5);
    // PRO price unchanged
    assert.equal(pricing.plans!['PRO'].price, 15.99);
  });

  it('Add-on price evaluates correctly with numeric variable and Math functions', () => {
    const pricingPath = 'tests/resources/pricing/positive/variables/addOn-with-variables.yml';
    const tempPricingPath = TEMP_FILE_PATH + pricingPath.split('/').pop();
    fs.copyFileSync(pricingPath, tempPricingPath);

    const pricing = retrievePricingFromPath(tempPricingPath);

    // For x=15, Math.floor(15/5)=3 -> condition false -> price = 100.0
    assert.equal(pricing.addOns!['test'].price, 100.0);
  });

  it('Variables field that is not an object should throw', () => {
    const pricingPath = 'tests/resources/pricing/negative/variables/variables-is-boolean.yml';
    const tempPricingPath = TEMP_FILE_PATH + pricingPath.split('/').pop();
    fs.copyFileSync(pricingPath, tempPricingPath);

    try {
      // This should throw
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _pricing = retrievePricingFromPath(tempPricingPath);
      assert.fail('Expected an error to be thrown');
    } catch (err) {
      assert.equal((err as Error).message, `The 'variables' field must be an object of type {[key: string]: any}`);
    }
  });
});
