// deno-lint-ignore-file no-explicit-any

import { calculateNextVersion } from '../../version-manager';

export default function v20Tov21Updater(extractedPricing: any): any {
  const nextVersion = calculateNextVersion(extractedPricing.version);

  extractedPricing.version = nextVersion!;

  _refactorPricingVersion(extractedPricing);

  return extractedPricing;
}

function _refactorPricingVersion(extractedPricing: any) {
  extractedPricing.syntaxVersion = extractedPricing.version;

  const createdAt = new Date(extractedPricing.createdAt);

  if (createdAt.toString() === 'Invalid Date') {
    extractedPricing.version = 'latest';
  } else {
    extractedPricing.version = `${createdAt.getFullYear()}-${
      createdAt.getMonth() + 1
    }-${createdAt.getDate()}`;
  }
}
