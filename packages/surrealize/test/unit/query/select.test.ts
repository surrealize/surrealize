import { describe, expect, test } from "bun:test";

import { Table, q } from "../../../src";

describe("select", () => {
	test("select ... from ...", () => {
		const query = q.select().from("user").toQuery();

		console.log(query.template);

		expect(query.template).toEqual([
			["SELECT * FROM ", ""],
			[expect.any(Table)],
		]);
	});
});
