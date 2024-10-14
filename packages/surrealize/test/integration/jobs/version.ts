import { expect } from "bun:test";
import type { Surrealize } from "surrealize";

const VERSION_REGEX = /surrealdb-([0-9]+.[0-9]+.[0-9]+)/;

export const testVersion = async (surrealize: Surrealize) => {
	const version = await surrealize.connection.version();

	expect(version).toMatch(VERSION_REGEX);

	const result = VERSION_REGEX.exec(version);
	if (!result) expect.unreachable();

	expect(Bun.semver.satisfies(result[1], "^2.0.0")).toBe(true);
};
