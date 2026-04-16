// deno-lint-ignore-file no-explicit-any

import { calculateNextVersion } from '../../version-manager';

export default function v30Tov31Updater(extractedPricing: any): any {
  const nextVersion = calculateNextVersion(extractedPricing.syntaxVersion);

  extractedPricing.syntaxVersion = nextVersion!;

  // No more actions are needed, since only the variables field is extended

  return extractedPricing;
}