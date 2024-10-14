import { surrealdbWasmEngines } from "@surrealdb/wasm";
import { beforeEach, describe, expect, test } from "bun:test";
import Surreal from "surrealdb";
import { Surrealize, surql } from "surrealize";

import { testFilter } from "./jobs/filter.ts";
import { testVersion } from "./jobs/version.ts";

const surrealize: Surrealize = new Surrealize({
	surreal: new Surreal({ engines: surrealdbWasmEngines() }),
});

beforeEach(async () => {
	await surrealize.connection.connect("mem:");
	await surrealize.connection.use({ namespace: "test", database: "test" });
});

describe("integration", () => {
	test("connection", async () => {
		const random = Math.floor(Math.random() * 100);
		const result = await surrealize.execute(surql`RETURN ${random}`);

		expect(result).toEqual(random);
	});

	test("version", () => testVersion(surrealize));
	test("filter", () => testFilter(surrealize));
});
