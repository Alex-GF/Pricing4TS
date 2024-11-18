import { Model, SolveResult } from 'minizinc';
import fs from 'fs';
import path from 'path';

const filePaths = {
  PricingModel: path.join(__dirname, 'raw-models/PricingModel.mzn'),
  ValidPricingOperation: path.join(__dirname, 'raw-models/operations/validation/valid-pricing.mzn'),
  ValidSubscriptionOperation: path.join(__dirname, 'raw-models/operations/validation/valid-subscription.mzn'),
  CheapestSubscriptionAnalysisOperation: path.join(__dirname, 'raw-models/operations/analysis/cheapest-subscription.mzn'),
  ConfigurationSpaceAnalysisOperation: path.join(__dirname, 'raw-models/operations/analysis/configuration-space.mzn'),
  MostExpensiveSubscriptionAnalysisOperation: path.join(__dirname, 'raw-models/operations/analysis/most-expensive-subscription.mzn'),
  FilterOperation: path.join(__dirname, 'raw-models/operations/filter/filter.mzn'),
  CheapestFilterOperation: path.join(__dirname, 'raw-models/operations/filter/cheapest-filtered-subscription.mzn'),
  ConfigurationSpaceFilterOperation: path.join(__dirname, 'raw-models/operations/filter/filtered-configuration-space.mzn'),
  MostExpensiveFilterOperation: path.join(__dirname, 'raw-models/operations/filter/most-expensive-filtered-subscription.mzn'),
};

export enum PricingOperation {
  PRICING_MODEL = 'PricingModel.mzn',
  VALID_PRICING = 'valid-pricing.mzn',
  VALID_SUBSCRIPTION = 'valid-subscription.mzn',
  CHEAPEST_SUBSCRIPTION = 'cheapest-subscription.mzn',
  CONFIGURATION_SPACE = 'configuration-space.mzn',
  MOST_EXPENSIVE_SUBSCRIPTION = 'most-expensive-subscription.mzn',
  FILTER = 'filter.mzn',
  CHEAPEST_FILTER = 'cheapest-filter.mzn',
  CONFIGURATION_SPACE_FILTER = 'configuration-space-filter.mzn',
  MOST_EXPENSIVE_FILTER = 'most-expensive-filter.mzn',
}

interface PricingOperationRecipe{
  operationFilename: string,
  operation: string
}

const pricingOperations: {[key in PricingOperation]: PricingOperationRecipe} = {
  [PricingOperation.PRICING_MODEL]: {operationFilename: PricingOperation.PRICING_MODEL, operation: fs.readFileSync(filePaths.PricingModel, 'utf8')},
  [PricingOperation.VALID_PRICING]: {operationFilename: PricingOperation.VALID_PRICING, operation: fs.readFileSync(filePaths.ValidPricingOperation, "utf-8")},
  [PricingOperation.VALID_SUBSCRIPTION]: {operationFilename: PricingOperation.VALID_SUBSCRIPTION, operation: fs.readFileSync(filePaths.ValidSubscriptionOperation, "utf-8")},
  [PricingOperation.CHEAPEST_SUBSCRIPTION]: {operationFilename: PricingOperation.CHEAPEST_SUBSCRIPTION, operation: fs.readFileSync(filePaths.CheapestSubscriptionAnalysisOperation, "utf-8")},
  [PricingOperation.CONFIGURATION_SPACE]: {operationFilename: PricingOperation.CONFIGURATION_SPACE, operation: fs.readFileSync(filePaths.ConfigurationSpaceAnalysisOperation, "utf-8")},
  [PricingOperation.MOST_EXPENSIVE_SUBSCRIPTION]: {operationFilename: PricingOperation.MOST_EXPENSIVE_SUBSCRIPTION, operation: fs.readFileSync(filePaths.MostExpensiveSubscriptionAnalysisOperation, "utf-8")},
  [PricingOperation.FILTER]: {operationFilename: PricingOperation.FILTER, operation: fs.readFileSync(filePaths.FilterOperation, "utf-8")},
  [PricingOperation.CHEAPEST_FILTER]: {operationFilename: PricingOperation.CHEAPEST_FILTER, operation: fs.readFileSync(filePaths.CheapestFilterOperation, "utf-8")},
  [PricingOperation.CONFIGURATION_SPACE_FILTER]: {operationFilename: PricingOperation.CONFIGURATION_SPACE_FILTER, operation: fs.readFileSync(filePaths.ConfigurationSpaceFilterOperation, "utf-8")},
  [PricingOperation.MOST_EXPENSIVE_FILTER]: {operationFilename: PricingOperation.MOST_EXPENSIVE_FILTER, operation: fs.readFileSync(filePaths.MostExpensiveFilterOperation, "utf-8")}
}

const operationRecipes: {[key in PricingOperation]: PricingOperationRecipe[]} = {
  [PricingOperation.PRICING_MODEL]: [
    pricingOperations[PricingOperation.PRICING_MODEL]
  ],
  [PricingOperation.VALID_PRICING]: [
    pricingOperations[PricingOperation.PRICING_MODEL],
    pricingOperations[PricingOperation.VALID_PRICING]
  ],
  [PricingOperation.VALID_SUBSCRIPTION]: [
    pricingOperations[PricingOperation.PRICING_MODEL],
    pricingOperations[PricingOperation.VALID_PRICING],
    pricingOperations[PricingOperation.VALID_SUBSCRIPTION]
  ],
  [PricingOperation.CHEAPEST_SUBSCRIPTION]: [
    pricingOperations[PricingOperation.PRICING_MODEL],
    pricingOperations[PricingOperation.VALID_PRICING],
    pricingOperations[PricingOperation.VALID_SUBSCRIPTION],
    pricingOperations[PricingOperation.CHEAPEST_SUBSCRIPTION]
  ],
  [PricingOperation.CONFIGURATION_SPACE]: [
    pricingOperations[PricingOperation.PRICING_MODEL],
    pricingOperations[PricingOperation.VALID_PRICING],
    pricingOperations[PricingOperation.VALID_SUBSCRIPTION],
    pricingOperations[PricingOperation.CONFIGURATION_SPACE]
  ],
  [PricingOperation.MOST_EXPENSIVE_SUBSCRIPTION]: [
    pricingOperations[PricingOperation.PRICING_MODEL],
    pricingOperations[PricingOperation.VALID_PRICING],
    pricingOperations[PricingOperation.VALID_SUBSCRIPTION],
    pricingOperations[PricingOperation.MOST_EXPENSIVE_SUBSCRIPTION]
  ],
  [PricingOperation.FILTER]: [
    pricingOperations[PricingOperation.PRICING_MODEL],
    pricingOperations[PricingOperation.VALID_PRICING],
    pricingOperations[PricingOperation.VALID_SUBSCRIPTION],
    pricingOperations[PricingOperation.FILTER]
  ],
  [PricingOperation.CHEAPEST_FILTER]: [
    pricingOperations[PricingOperation.PRICING_MODEL],
    pricingOperations[PricingOperation.VALID_PRICING],
    pricingOperations[PricingOperation.VALID_SUBSCRIPTION],
    pricingOperations[PricingOperation.FILTER],
    pricingOperations[PricingOperation.CHEAPEST_FILTER]
  ],
  [PricingOperation.CONFIGURATION_SPACE_FILTER]: [
    pricingOperations[PricingOperation.PRICING_MODEL],
    pricingOperations[PricingOperation.VALID_PRICING],
    pricingOperations[PricingOperation.VALID_SUBSCRIPTION],
    pricingOperations[PricingOperation.FILTER],
    pricingOperations[PricingOperation.CONFIGURATION_SPACE_FILTER]
  ],
  [PricingOperation.MOST_EXPENSIVE_FILTER]: [
    pricingOperations[PricingOperation.PRICING_MODEL],
    pricingOperations[PricingOperation.VALID_PRICING],
    pricingOperations[PricingOperation.VALID_SUBSCRIPTION],
    pricingOperations[PricingOperation.FILTER],
    pricingOperations[PricingOperation.MOST_EXPENSIVE_FILTER]
  ]
}

export default class PricingCSP {
  private model: Model;
  private pricingData: string;

  constructor() {
    this.model = new Model();

    this.pricingData = '';
  }

  public async runPricingOperation(
    pricingOperation: PricingOperation,
    data: string
  ): Promise<SolveResult> {
    
    this._resetModel();

    const operationRecipe: PricingOperationRecipe[] = operationRecipes[pricingOperation];
    
    for (const operator of operationRecipe){
      this.model.addFile(operator.operationFilename, operator.operation);
    }

    if (this.pricingData !== data) {
      this.pricingData = data;
      this.model.addDznString(data);
    }

    const result = this.model.solve({
      options: {
        solver: 'gecode',
        model: pricingOperation,
        statistics: true,
        'all-solutions':
          pricingOperation === PricingOperation.CONFIGURATION_SPACE ||
          pricingOperation === PricingOperation.CONFIGURATION_SPACE_FILTER,
      },
    });

    return result;
  }

  _resetModel() {
    this.model = new Model();
  }
}
