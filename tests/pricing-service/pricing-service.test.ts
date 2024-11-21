import PricingService from '../../src/services/pricing.service';
import { retrievePricingFromPath } from '../../src/utils/yaml-utils';
import { Pricing } from '../../src/models/pricing2yaml/pricing';
import assert from 'assert';
import { readCSVFile, parseCSVContent } from '../utils/csv-utils';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { ErrorMessage } from 'minizinc';

const OLD_VERSION_SAAS_CSV_PATH = 'tests/pricing-service/data/pricing-service-tests.csv';
const suiteUUID = uuidv4();
const TEMP_FILE_PATH = `tests/resources/temp-${suiteUUID}/test_`;
const TEMP_DIR = `tests/resources/temp-${suiteUUID}/`;

const oldVersionSaaSParameters = parseCSVContent(readCSVFile(OLD_VERSION_SAAS_CSV_PATH));

// describe('Given pricing should return its analytics', () => {
//   const errors: { pricingPath: string; error: string }[] = [];

//   beforeAll(() => {
//     fs.mkdirSync(TEMP_DIR);
//   });

//   afterAll(() => {
//     fs.rmdirSync(TEMP_DIR, { recursive: true });
//     // Vuelca el contenido de errors en un archivo CSV dentro del directorio logs/
//     const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
//     const errorCSVPath = `tests/logs/pricing-service-errors-${timestamp}.csv`;

//     const errorCSVContent = errors.map(({ pricingPath, error }) => [pricingPath, error]);
//     const errorCSVHeader = ['pricingPath', 'error'];

//     // Si no existe el directorio logs, crealo
//     if (!fs.existsSync('tests/logs')) {
//       fs.mkdirSync('tests/logs');
//     }

//     fs.writeFileSync(
//       errorCSVPath,
//       errorCSVContent.reduce(
//         (acc, row) => acc + row.join(',') + '\n',
//         errorCSVHeader.join(',') + '\n'
//       )
//     );
//   });

//   for (const { sectionName, tests } of oldVersionSaaSParameters) {
//     describe(sectionName, () => {
//       for (const { pricingPath, expected } of tests) {
//         let pricingService: PricingService | null = null;
//         let pricing: Pricing;

//         const tempPricingPath = TEMP_FILE_PATH + pricingPath.split('/').pop();

//         beforeEach(() => {
//           // Create a temp file from the TEST_PRICING_YAML_PATH file
//           fs.copyFileSync(pricingPath, tempPricingPath);
//           pricing = retrievePricingFromPath(tempPricingPath);

//           pricingService = new PricingService(pricing);
//         });

//         it(`Get analytics of ${expected}`, async () => {
//           try {
//             const analytics = await pricingService!.getAnalytics();
//             assert.equal(pricing.saasName.split(' ')[0], expected);
//           } catch (e) {
//             errors.push({ pricingPath, error: `"${(e as ErrorMessage).message}"` });
//           }
//         });
//       }
//     });
//   }
// });

describe('Single pricing test', () => {
  const errors: { pricingPath: string; error: string }[] = [];

  beforeAll(() => {
    fs.mkdirSync(TEMP_DIR);
  });

  afterAll(() => {
    fs.rmdirSync(TEMP_DIR, { recursive: true });
    // Vuelca el contenido de errors en un archivo CSV dentro del directorio logs/
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const errorCSVPath = `tests/logs/pricing-service-errors-${timestamp}.csv`;

    const errorCSVContent = errors.map(({ pricingPath, error }) => [pricingPath, error]);
    const errorCSVHeader = ['pricingPath', 'error'];

    // Si no existe el directorio logs, crealo
    if (!fs.existsSync('tests/logs')) {
      fs.mkdirSync('tests/logs');
    }

    fs.writeFileSync(
      errorCSVPath,
      errorCSVContent.reduce(
        (acc, row) => acc + row.join(',') + '\n',
        errorCSVHeader.join(',') + '\n'
      )
    );
  });

  const pricingPath = 'tests/resources/pricing/full/2021/evernote.yml';
  const expected = 'Evernote';
  let pricingService: PricingService | null = null;
  let pricing: Pricing;

  const tempPricingPath = TEMP_FILE_PATH + pricingPath.split('/').pop();

  beforeEach(() => {
    // Create a temp file from the TEST_PRICING_YAML_PATH file
    fs.copyFileSync(pricingPath, tempPricingPath);
    pricing = retrievePricingFromPath(tempPricingPath);

    pricingService = new PricingService(pricing);
  });

  it(`Get analytics of ${expected}`, async () => {
    try {
      const analytics = await pricingService!.getAnalytics();
      assert.equal(pricing.saasName.split(' ')[0], expected);
    } catch (e) {
      errors.push({ pricingPath, error: `"${(e as ErrorMessage).message}"` });
    }
  });
});
