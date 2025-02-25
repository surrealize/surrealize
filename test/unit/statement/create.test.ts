import { describe, test } from "bun:test";
import { Table, q, surql } from "surrealize";

import { expectQueriesEquals } from "../../utils.ts";

describe("create ...", () => {
	test("...", () => {
		expectQueriesEquals(q.create("user"), surql`CREATE ${Table.from("user")}`);
	});

	test("content ...", () => {
		expectQueriesEquals(
			q.create("user").content({ name: "Bob" }),
			surql`CREATE ${Table.from("user")} CONTENT ${{ name: "Bob" }}`,
		);
	});

	test("set ...", () => {
		expectQueriesEquals(
			q
				.create("user")
				.set({ "first.name": "Bob", nested: { friend: "Alice" } }),
			surql`CREATE ${Table.from("user")} SET first.name = ${"Bob"}, nested = ${{ friend: "Alice" }}`,
		);
	});

	test("return ...", () => {
		expectQueriesEquals(
			q.create("user").return("after"),
			surql`CREATE ${Table.from("user")} RETURN AFTER`,
		);

		expectQueriesEquals(
			q.create("user").return("before"),
			surql`CREATE ${Table.from("user")} RETURN BEFORE`,
		);

		expectQueriesEquals(
			q.create("user").return("diff"),
			surql`CREATE ${Table.from("user")} RETURN DIFF`,
		);

		expectQueriesEquals(
			q.create("user").return("none"),
			surql`CREATE ${Table.from("user")} RETURN NONE`,
		);
	});
});
