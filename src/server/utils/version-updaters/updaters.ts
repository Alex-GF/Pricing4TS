// deno-lint-ignore-file no-explicit-any

import v10toV11Updater from "./v10-to-v11/v10-to-v11-updater";
import v11toV20Updater from "./v11-to-v20/v11-to-v20-updater";
import v20toV21Updater from "./v20-to-v21/v20-to-v21-updater";

export const updaters: {[key: string]: ((extractedPricing: any) => any) | null} = {
    "1.0": v10toV11Updater,
    "1.1": v11toV20Updater,
    "2.0": v20toV21Updater,
    "2.1": null
}