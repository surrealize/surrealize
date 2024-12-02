import { describe, expect, test } from "bun:test";

import { flattenObject } from "../../../src/utils/object.ts";

describe("Object utils", () => {
	test("flattenObject", () => {
		expect(
			flattenObject({ test: 1, nested: { test: 2, nested: { test: 3 } } }),
		).toEqual({ test: 1, "nested.test": 2, "nested.nested.test": 3 });

		expect(
			flattenObject({
				date: new Date("2023-01-01"),
				nested: { date: new Date("2023-01-01") },
			}),
		).toEqual({
			date: new Date("2023-01-01"),
			"nested.date": new Date("2023-01-01"),
		});

		expect(flattenObject({ test: [1, { foo: "bar" }] })).toEqual({
			"test.0": 1,
			"test.1.foo": "bar",
		});
	});
});
