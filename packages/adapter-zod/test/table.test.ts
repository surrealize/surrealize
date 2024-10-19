import { Table } from "@surrealize/core";
import { describe, expect, test } from "bun:test";
import { z } from "zod";

import { tableType } from "../src";

describe("Table", () => {
	test("without options", () => {
		const table1 = Table.from("user");
		const table2 = Table.from("user");
		const table3 = Table.from("post");

		expect(tableType().parse(table1)).toEqual(table2);
		expect(tableType().parse(table1)).not.toEqual(table3);
		expect(() => tableType().parse("invalid")).toThrow();
	});

	test("with table schema", () => {
		const tableLiteralSchema = z.literal("user");

		const table1 = Table.from("user");
		const table2 = Table.from("post");

		const tableSchema = tableType({ table: tableLiteralSchema });

		expect(tableSchema.parse(table1)).toEqual(table1);
		expect(() => tableSchema.parse(table2)).toThrow();
	});

	test("with table object", () => {
		const table = Table.from("user");

		const table1 = Table.from("user");
		const table2 = Table.from("post");

		const tableSchema = tableType({ table });

		expect(tableSchema.parse(table1)).toEqual(table1);
		expect(() => tableSchema.parse(table2)).toThrow();
	});
});
