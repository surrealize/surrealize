import { beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { Surrealize, surql } from "surrealize";

import { testSelectOnly, testSelectWhere } from "./jobs/select.ts";
import { testVersion } from "./jobs/version.ts";

const surrealize: Surrealize = new Surrealize({
	url: new URL("ws://localhost:8000"),

	namespace: "test",
	database: "test",

	timeout: 5000,
});

beforeAll(async () => {
	await surrealize.connect();
});

beforeEach(async () => {
	await surrealize.execute(surql`REMOVE DATABASE IF EXISTS test`);
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
