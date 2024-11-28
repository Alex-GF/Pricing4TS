import { retrievePricingFromPath } from '../../src/main';
import { pricing2DZN } from '../../src/server/utils/dzn-exporter/pricing-dzn-exporter';
import type { Pricing } from '../../src/main';
import {
  calculateAddOnAvailableForMatrix,
  calculateAddOnsDependsOnOExcludesMatrix,
  calculateAddOnsFeaturesMatrix,
  calculateAddOnsUsageLimitsExtensionsMatrix,
  calculateAddOnsUsageLimitsMatrix,
  getAddOnNames,
} from '../../src/main/models/pricing2yaml/addon';
import { calculatePlanFeaturesMatrix, getPlanNames } from '../../src/main/models/pricing2yaml/plan';
import { formatMatrixToString } from '../../src/server/utils/dzn-exporter/string-utils';

const path = 'tests/resources/pricing/full/';

describe('Given pricing should produce a Minizinc data file', () => {
  it('Check petclinic addons features', () => {
    const addOnsFeatures = [
      [0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 1],
    ];
    const pricing: Pricing = retrievePricingFromPath(path + 'petclinic.yml');
    const actualResult = calculateAddOnsFeaturesMatrix(pricing.features, pricing.addOns || []);

    expect(actualResult).toStrictEqual(addOnsFeatures);
  });

  it('Check zoom addons features', () => {
    const addOnsFeatures = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    ];
    const addOnsUsageLimits = [
      [1000, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    const addOnsUsageLimitsExtensions = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    const addOnsAvailableFor = [
      [1, 1, 1],
      [1, 1, 1],
      [0, 1, 1],
    ];
    const addOnsDependsOn = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    const pricing: Pricing = retrievePricingFromPath(path + 'zoom.yml');
    const actualAddOnsFeatures = calculateAddOnsFeaturesMatrix(
      pricing.features,
      pricing.addOns || []
    );
    const actualAddOnsUsageLimits = calculateAddOnsUsageLimitsMatrix(
      pricing.usageLimits || [],
      pricing.addOns || []
    );
    const actualAddOnsUsageLimitsExtensions = calculateAddOnsUsageLimitsExtensionsMatrix(
      pricing.usageLimits || [],
      pricing.addOns || []
    );
    const actualAddOnsAvailableFor = calculateAddOnAvailableForMatrix(
      getPlanNames(pricing.plans),
      pricing.addOns
    );
    const actualAddOnsDependsOn = calculateAddOnsDependsOnOExcludesMatrix(
      pricing.addOns
    );

    expect(actualAddOnsFeatures).toStrictEqual(addOnsFeatures);
    expect(actualAddOnsUsageLimits).toStrictEqual(addOnsUsageLimits);
    expect(actualAddOnsUsageLimitsExtensions).toStrictEqual(addOnsUsageLimitsExtensions);
    expect(actualAddOnsAvailableFor).toStrictEqual(addOnsAvailableFor);
    expect(actualAddOnsDependsOn).toStrictEqual(addOnsDependsOn);
  });
  it('Check box plans matrix', () => {
    const planFeatures = [
      [
        1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      [
        1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ],
      [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
      ],
      [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      ],
    ];

    const pricing: Pricing = retrievePricingFromPath(path + 'box.yml');
    const actualPlanFeatures = calculatePlanFeaturesMatrix(pricing.plans!);

    expect(actualPlanFeatures).toStrictEqual(planFeatures);
  });
});

describe('Formatter suite tests', () => {
  it('Given different sizes of matrix should throw', () => {
    expect(() => {
      formatMatrixToString(['one', 'two'], [[]]);
    }).toThrow('Names array has to be equal to the number of rows of the matrix');
  });
  it('Given 1d array should return empty', () => {
    expect(formatMatrixToString([], [])).toBe('');
  });
});
