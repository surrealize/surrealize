import { describe, expect, test } from "bun:test";
import { RecordId, Repository, Table, neq, surql } from "surrealize";

const table = Table.from("user");
const repo = new Repository(table);

describe("Repository update methods", () => {
	test("update", () => {
		const record = { id: RecordId.from("user:1"), name: "Bob" };

		expect(repo.update(record).template).toEqual(
			surql`UPDATE ONLY ${record.id} CONTENT ${record}`.template,
		);
	});
	test("updateBy", () => {
		expect(repo.updateBy({ name: "Bob" }, { role: "admin" }).template).toEqual(
			surql`UPDATE ${table} SET role = ${"admin"} WHERE (name == ${"Bob"})`
				.template,
		);
		expect(
			repo.updateBy(
				{ name: { first: "Alice" } },
				{ time: { updatedAt: new Date("2023-01-01") }, admin: true },
			).template,
		).toEqual(
			surql`UPDATE ${table} SET time.updatedAt = ${new Date("2023-01-01")}, admin = ${true} WHERE (name.first == ${"Alice"})`
				.template,
		);
		expect(
			repo.updateBy([neq("name.first", "Alice"), neq("name.last", "Smith")], {
				friends: ["Alice", "Bob"],
			}).template,
		).toEqual(
			surql`UPDATE ${table} SET friends.0 = ${"Alice"}, friends.1 = ${"Bob"} WHERE (name.first != ${"Alice"} && name.last != ${"Smith"})`
				.template,
		);
	});

	test("updateById", () => {
		expect(
			repo.updateById(RecordId.from("user:bob"), { name: { first: "Bob" } })
				.template,
		).toEqual(
			surql`UPDATE ONLY ${RecordId.from("user:bob")} SET name.first = ${"Bob"}`
				.template,
		);
	});
});
