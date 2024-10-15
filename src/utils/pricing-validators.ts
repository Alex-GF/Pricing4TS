import * as semver from '@std/semver';
import { SemVer } from '@std/semver/types';
import { LATEST_PRICING2YAML_VERSION } from "./version-manager.ts";

const VERSION_REGEXP = /^\d+\.\d+$/;

export function validateName(name: string | null, item: string): string {
    if (name === null) {
        throw new Error(`The ${item} name must not be null`);
    }

    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
        throw new Error(`The ${item} name must not be empty`);
    }

    if (trimmedName.length < 3) {
        throw new Error(`The ${item} name must have at least 3 characters`);
    }

    if (trimmedName.length > 50) {
        throw new Error(`The ${item} name must have at most 50 characters`);
    }

    return name;
}

export function validateVersion(version: string): SemVer{
    if (version === null || version === undefined) {
        throw new Error(`The version field of the pricing must not be null or undefined. Please ensure that the version field is present and correctly formatted.`);
    }

    if (typeof version !== 'string' || !VERSION_REGEXP.test(version)) {
        throw new Error(`The version field of the pricing does not follow the required structure: X.Y (being X and Y numbers). Please ensure it is a string in the format X.Y`);
    }

    const parsedVersion = semver.parse(version + ".0");

    if (!semver.equals(parsedVersion, LATEST_PRICING2YAML_VERSION)) {
        throw new Error(`The version field of the pricing is not equal to the last supported version. Please ensure you are using exactly the version ${LATEST_PRICING2YAML_VERSION.major}.${LATEST_PRICING2YAML_VERSION.minor}`);
    }

    return parsedVersion;
}

export function validateCreatedAt(createdAt: string | Date | null): Date{
    if (createdAt === null || createdAt === undefined) {
        throw new Error(`The createdAt field must not be null or undefined. Please ensure that the createdAt field is present and correctly formatted (as Date or string).`);
    }

    if (typeof createdAt === 'string') {
        createdAt = new Date(createdAt);
    }

    if (!(createdAt instanceof Date) || isNaN(createdAt.getTime())) {
        throw new Error(`The createdAt field must be a valid Date object or a string in a recognized date format.`);
    }

    const now = new Date();
    if (createdAt > now) {
        throw new Error(`The createdAt field must not be a future date.`);
    }

    return createdAt;
}