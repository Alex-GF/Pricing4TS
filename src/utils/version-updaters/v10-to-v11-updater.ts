// deno-lint-ignore-file no-explicit-any

import { calculateNextVersion } from "../version-manager.ts";

export default function v10Tov11Updater(
  extractedPricing: any
): object {
  const nextVersion = calculateNextVersion(extractedPricing.version);

  extractedPricing.version = nextVersion!;

  _updateDayMonthYearToASingleField(extractedPricing);

  return extractedPricing;
}

function _updateDayMonthYearToASingleField(
  extractedPricing: any
): void {
  const errors: string[] = [];

  if (extractedPricing.day === undefined || extractedPricing.day === null) {
    errors.push("day field is mandatory");
  } else if (typeof extractedPricing.day !== "number") {
    errors.push("day field must be an integer");
  }

  if (extractedPricing.month === undefined || extractedPricing.month === null) {
    errors.push("month field is mandatory");
  } else if (typeof extractedPricing.month !== "number") {
    errors.push("month field must be an integer");
  }

  if (extractedPricing.year === undefined || extractedPricing.year === null) {
    errors.push("year field is mandatory");
  } else if (typeof extractedPricing.year !== "number") {
    errors.push("year field must be an integer");
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  const day = extractedPricing.day as number;
  const month = extractedPricing.month as number;
  const year = extractedPricing.year as number;

  try {
    const createdAt = new Date(year, month - 1, day)
      .toISOString()
      .split("T")[0]; // Formato yyyy-mm-dd

    extractedPricing.createdAt = createdAt;
    delete extractedPricing.day;
    delete extractedPricing.month;
    delete extractedPricing.year;
  } catch (e) {
    throw new Error((e as Error).message);
  }
}