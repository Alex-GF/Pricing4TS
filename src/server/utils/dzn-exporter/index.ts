import path from 'node:path';
import { Pricing } from '../../../types';
import { retrievePricingFromPath } from '../../server';
import { pricing2DZN } from '../../../server/utils/dzn-exporter/pricing-dzn-exporter';
import fs from 'node:fs';

export interface Chunk {
  left: DZNKeywords;
  value: string;
  row?: DZNKeywords;
  col?: DZNKeywords;
}

export enum DZNKeywords {
  NumberOfFeatures = 'num_features',
  NumberOfUsageLimits = 'num_usage_limits',
  NumberOfPlans = 'num_plans',
  NumberOfAddOns = 'num_addons',
  Features = 'features',
  UsageLimits = 'usage_limits',
  Plans = 'plans',
  AddOns = 'addons',
  PlansPrices = 'plans_prices',
  AddOnsPrices = 'addons_prices',
  BooleanUsageLimits = 'boolean_usage_limits',
  PlansFeatures = 'plans_features',
  PlansUsageLimits = 'plans_usage_limits',
  LinkedFeatures = 'linked_features',
  AddOnsFeatures = 'addons_features',
  AddOnsUsageLimits = 'addons_usage_limits',
  AddOnsUsageLimitsExtensions = 'addons_usage_limits_extensions',
  AddOnsAvailableFor = 'addons_available_for',
  AddOnsDependsOn = 'addons_depends_on',
  AddOnsExcludes = 'addons_excludes',
}

export function saveDZNfile(source: string, savePath: string): void {
  try {
    const pricing: Pricing = retrievePricingFromPath(path.resolve(source));
    const file = pricing2DZN(pricing);

    const dznFolder = path.resolve(savePath);

    if (!fs.existsSync(dznFolder)) {
      console.log(`Creating folder ${dznFolder}...`);
      fs.mkdirSync(savePath, {recursive: true});
    }

    const filename = path.basename(source, ".yml") + '.dzn';

    fs.writeFileSync(path.join(savePath, filename), file);
    console.log(`\t DZN File Saved in ./${path.join(savePath, filename)}`);
  } catch (err) {
    console.error(`Error while parsing file '${source}'. Error: ${err}`);
  }
}
