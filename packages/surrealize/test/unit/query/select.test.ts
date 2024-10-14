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
});
