import { describe, expect, test } from "bun:test";
import { RecordId, Table, eq, q, surql } from "surrealize";

import { expectQueriesEquals } from "../../utils.ts";

describe("select ... from ...", () => {
	test("...", () => {
		expectQueriesEquals(
			q.select().from("user"),
			surql`SELECT * FROM ${Table.from("user")}`,
		);
	});

	test("where ...", () => {
		expectQueriesEquals(
			q
				.select()
				.from("user")
				.where([eq("id", 1)]),
			surql`SELECT * FROM ${Table.from("user")} WHERE (id = ${1})`,
		);
	});

	test("limit ... start ...", () => {
		expectQueriesEquals(
			q.select().from("user").limit(20).start(10),
			surql`SELECT * FROM ${Table.from("user")} LIMIT 20 START 10`,
		);
	});

	test("order ...", () => {
		expectQueriesEquals(
			q.select().from("user").order("rand"),
			surql`SELECT * FROM ${Table.from("user")} ORDER rand()`,
		);

		expectQueriesEquals(
			q
				.select()
				.from("user")
				.order([{ field: "age" }]),
			surql`SELECT * FROM ${Table.from("user")} ORDER age`,
		);

		expectQueriesEquals(
			q
				.select()
				.from("user")
				.order([{ field: "age", direction: "descending" }]),
			surql`SELECT * FROM ${Table.from("user")} ORDER age DESC`,
		);

		expectQueriesEquals(
			q
				.select()
				.from("user")
				.order([{ field: "age", direction: "ascending", mode: "numeric" }]),
			surql`SELECT * FROM ${Table.from("user")} ORDER age NUMERIC ASC`,
		);

		expectQueriesEquals(
			q
				.select()
				.from("user")
				.order([
					{ field: "age", direction: "asc", mode: "collate" },
					{ field: "name", direction: "desc" },
				]),
			surql`SELECT * FROM ${Table.from("user")} ORDER age COLLATE ASC, name DESC`,
		);
	});

	test("fetch ...", () => {
		// statement with fetch fields
		expectQueriesEquals(
			q.select().from("user").fetch(["id", "name"]),
			surql`SELECT * FROM ${Table.from("user")} FETCH id, name`,
		);

		// statement with fetch but without fields
		expectQueriesEquals(
			q.select().from("user").fetch(),
			surql`SELECT * FROM ${Table.from("user")}`,
		);

		// statement with fetch but invalid fields
		expect(() =>
			q.select().from("user").fetch(["id", "name", "invalid."]),
		).toThrow();
	});
});

describe("select ... from only ...", () => {
	test("...", () => {
		expectQueriesEquals(
			q.select(["id", "name"]).fromOnly("user").limit(1),
			surql`SELECT id, name FROM ONLY ${Table.from("user")} LIMIT 1`,
		);
	});
});

describe("select value ... from ...", () => {
	test("...", () => {
		expectQueriesEquals(
			q.selectValue("name").from("user"),
			surql`SELECT VALUE name FROM ${Table.from("user")}`,
		);
	});
});

describe("select value ... from only ...", () => {
	test("...", () => {
		expectQueriesEquals(
			q.selectValue("name").fromOnly("user:bob"),
			surql`SELECT VALUE name FROM ONLY ${RecordId.from("user:bob")}`,
		);
	});
});
