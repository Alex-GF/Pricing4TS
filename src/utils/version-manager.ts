import type { SemVer } from "@std/semver/types";
import * as semver from "@std/semver";

export const PRICING2YAML_VERSIONS: Array<SemVer> = [
                                                     semver.parse("1.0.0"),
                                                     semver.parse("1.1.0"), 
                                                     semver.parse("2.0.0")
                                                    ];

export const LATEST_PRICING2YAML_VERSION: SemVer = PRICING2YAML_VERSIONS[PRICING2YAML_VERSIONS.length - 1];