import { describe, expect, test } from "bun:test";
import { Table, q } from "surrealize";

describe("select", () => {
	test("select ... from ...", () => {
		const query = q.select().from("user").toQuery();

		expect(query.template).toEqual([
			["SELECT * FROM ", ""],
			[expect.any(Table)],
		]);
	});

	test("select ... from ... fetch ...", () => {
		// statement with fetch fields
		expect(
			q.select().from("user").fetch("id", "name").toQuery().template,
		).toEqual([["SELECT * FROM ", " FETCH id, name"], [expect.any(Table)]]);

		// statement with fetch but without fields
		expect(q.select().from("user").fetch().toQuery().template).toEqual([
			["SELECT * FROM ", ""],
			[expect.any(Table)],
		]);

		// statement with fetch but invalid fields
		expect(() =>
			q.select().from("user").fetch("id", "name", "invalid.").toQuery(),
		).toThrow();
	});
});
