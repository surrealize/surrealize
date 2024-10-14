import { describe, expect, test } from "bun:test";
import { RecordId, Table } from "surrealize";
import { z } from "zod";

import { recordIdType } from "../src";

describe("RecordId", () => {
	test("without options", () => {
		const recordId1 = RecordId.from("user:bob");
		const recordId2 = RecordId.from("user:bob");
		const recordId3 = RecordId.from("user:alice");

		expect(recordIdType().parse(recordId1)).toEqual(recordId2);
		expect(recordIdType().parse(recordId1)).not.toEqual(recordId3);
		expect(() => recordIdType().parse("invalid")).toThrow();
	});

	test("with table schema", () => {
		const tableSchema = z.literal("user");

		const recordId1 = RecordId.from("user:bob");
		const recordId2 = RecordId.from("post:1");

		const recordIdSchema = recordIdType({ table: tableSchema });

		expect(recordIdSchema.parse(recordId1)).toEqual(recordId1);
		expect(() => recordIdSchema.parse(recordId2)).toThrow();
	});

	test("with table object", () => {
		const table = Table.from("user");

		const recordId1 = RecordId.from("user:bob");
		const recordId2 = RecordId.from("post:1");

		const recordIdSchema = recordIdType({ table: table });

		expect(recordIdSchema.parse(recordId1)).toEqual(recordId1);
		expect(() => recordIdSchema.parse(recordId2)).toThrow();
	});

	test("with id schema", () => {
		// id schema which only accepts letters ([a-z])
		const idSchema = z.string().regex(/^[a-z]+$/);

		const recordId1 = RecordId.from("user:bob");
		const recordId2 = RecordId.from("user:bob2");

		const recordIdSchema = recordIdType({ id: idSchema });

		expect(recordIdSchema.parse(recordId1)).toEqual(recordId1);
		expect(() => recordIdSchema.parse(recordId2)).toThrow();
	});

	test("with table and id schema", () => {
		const tableSchema = z.literal("user");

		// id schema which only accepts letters ([a-z])
		const idSchema = z.string().regex(/^[a-z]+$/);

		const recordId1 = RecordId.from("user:bob");
		const recordId2 = RecordId.from("user:bob2");
		const recordId3 = RecordId.from("users:bob");

		const recordIdSchema = recordIdType({ table: tableSchema, id: idSchema });

		expect(recordIdSchema.parse(recordId1)).toEqual(recordId1);
		expect(() => recordIdSchema.parse(recordId2)).toThrow();
		expect(() => recordIdSchema.parse(recordId3)).toThrow();
	});
});
