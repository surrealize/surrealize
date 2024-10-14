import {
	RecordId,
	type RecordIdLike,
	type RecordIdValue,
	Table,
	type TableLike,
} from "surrealize";
import { z } from "zod";

import type { ZodCustom } from "../utils.ts";

/**
 * The options to use for the record id schema creation.
 */
export type RecordIdTypeOptions<
	TTable extends string,
	TId extends RecordIdValue,
> = {
	/**
	 * An optional Zod schema to validate the table part of the record id.
	 */
	table?: z.ZodType<TTable> | TableLike<TTable>;

	/**
	 * An optional Zod schema to validate the id part of the record id.
	 */
	id?: z.ZodType<TId>;

	/**
	 * An optional record id to validate against.
	 *
	 * If provided, the schema will only validate against this record id.
	 *
	 * **Please note:** Using this option with `table` or `id` makes no sense
	 * as this option already validates the table and id parts of the record id.
	 */
	recordId?: RecordIdLike<TTable, TId>;
};

/**
 * A Zod schema for the id part of a record id.
 *
 * This can be used to validate the id part of a record id.
 */
export const recordIdValueType: ZodCustom<RecordIdValue> =
	z.custom<RecordIdValue>((value) =>
		z
			.union([
				z.string(),
				z.number(),
				z.bigint(),
				z.unknown().array(),
				z.record(z.unknown()),
				// TODO uuid type
			])
			.parse(value),
	);

export type RecordIdValueType = typeof recordIdValueType;

/**
 * A function which creates a Zod schema for a record id based on the provided options.
 *
 * @param options The options to use for the record id schema.
 * @returns The Zod schema for the record id.
 */
export const recordIdType = <
	TTable extends string = string,
	TId extends RecordIdValue = RecordIdValue,
>(
	options: RecordIdTypeOptions<TTable, TId> = {},
): RecordIdType<TTable, TId> =>
	z.custom((recordId) =>
		z
			.instanceof(RecordId)
			.superRefine((value, ctx) => {
				const idValueResult = recordIdValueType.safeParse(value.id);
				if (!idValueResult.success)
					idValueResult.error.issues.map((issue) => ctx.addIssue(issue));

				if (options.recordId) {
					if (typeof options.recordId === "string")
						options.recordId = RecordId.from(options.recordId);

					const success = options.recordId.equals(value);
					if (!success)
						ctx.addIssue({
							code: z.ZodIssueCode.custom,
							message: "RecordId does not match the provided RecordId",
							params: {
								wanted: options.recordId.toString(),
								received: value.toString(),
							},
						});
				}

				if (options.table) {
					// If the table input is an actual table, convert it to a zod schema.
					if (options.table instanceof Table)
						options.table = z.literal(options.table.name);

					if (typeof options.table === "string")
						options.table = z.literal(options.table);

					const result = options.table.safeParse(value.table);
					if (!result.success)
						result.error.issues.map((issue) => ctx.addIssue(issue));
				}

				if (options.id) {
					const result = options.id.safeParse(value.id);
					if (!result.success)
						result.error.issues.map((issue) => ctx.addIssue(issue));
				}
			})
			.parse(recordId),
	);

/**
 * The Zod schema for a record id. This type is returned by the {@link recordIdType} function.
 */
export type RecordIdType<
	TTable extends string = string,
	TId extends RecordIdValue = RecordIdValue,
> = ZodCustom<RecordId<TTable, TId>>;
