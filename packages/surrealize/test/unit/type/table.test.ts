import { describe, expect, test } from "bun:test";
import { RecordId, Table } from "surrealize";

describe("Table", () => {
	test("constructor", () => {
		const table = new Table("users");
		expect(table.name).toEqual("users");
	});

	test("equals", () => {
		const table1 = new Table("users");
		const table2 = new Table("users");
		const table3 = new Table("posts");

		expect(table1.equals(table2)).toBe(true);
		expect(table1.equals(table3)).toBe(false);
	});

	test("contains", () => {
		const table = new Table("users");
		const recordId1 = new RecordId("users", "123");
		const recordId2 = new RecordId("posts", "123");

		expect(table.contains(recordId1)).toBe(true);
		expect(table.contains(recordId2)).toBe(false);
	});
});
