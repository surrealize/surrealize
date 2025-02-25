import { afterEach, beforeAll, describe, expect, test } from "bun:test";
import { Surrealize, WebSocketEngine, surql } from "surrealize";

import { testSelectOnly, testSelectWhere } from "./jobs/select.ts";
import { testVersion } from "./jobs/version.ts";
import { cleanupDemoData } from "./utils.ts";

const surrealize: Surrealize = new Surrealize(
	new WebSocketEngine("ws://localhost:8000", {
		namespace: "test",
		database: "test",
	}),
);

beforeAll(async () => {
	await surrealize.connect();
});

afterEach(async () => {
	await cleanupDemoData(surrealize);
});

describe("Integration", () => {
	test("connection", async () => {
		const random = Math.floor(Math.random() * 100);
		const result = await surrealize.execute(surql`RETURN ${random}`);

		expect(result).toEqual(random);
	});

	test("version", () => testVersion(surrealize));

	test("select from where", () => testSelectWhere(surrealize));

	test("select from only", () => testSelectOnly(surrealize));

	test("None and Null", async () => {
		expect(await surrealize.execute(surql`RETURN NONE`)).toEqual(undefined);
		expect(await surrealize.execute(surql`RETURN NULL`)).toEqual(null);
	});
});
