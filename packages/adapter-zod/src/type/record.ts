import type { RecordIdValue } from "surrealize";
import { z } from "zod";

import {
	type RecordIdType,
	type RecordIdTypeOptions,
	recordIdType,
} from "./recordid.ts";

/**
 * A function to create a Zod schema for a record with an `id` property.
 *
 * Use this function to create a Zod schema for a record and extend it using the `extend` method from zod.
 *
 * @param options The options to use for the `id` record id schema.
 * @returns The Zod schema.
 */
export const recordType = <
	TTable extends string = string,
	TValue extends RecordIdValue = RecordIdValue,
>(
	options: RecordIdTypeOptions<TTable, TValue> = {},
): RecordType<TTable, TValue> =>
	z.object({
		id: recordIdType(options),
	});

/**
 * A function to create a Zod object for a relation record with `id`, `in` and `out` properties.
 *
 * Use this function to create a Zod schema for a relation record and extend it using the `extend` method from zod.
 *
 * @param options The options to use for the `id` record id schema.
 * @param inOptions The options to use for the `in` record id schema.
 * @param outOptions The options to use for the `out` record id schema.
 * @returns The Zod schema.
 */
export const relationRecordType = <
	TTable extends string = string,
	TValue extends RecordIdValue = RecordIdValue,
	TInTable extends string = string,
	TInValue extends RecordIdValue = RecordIdValue,
	TOutTable extends string = string,
	TOutValue extends RecordIdValue = RecordIdValue,
>(
	options: RecordIdTypeOptions<TTable, TValue>,
	inOptions: RecordIdTypeOptions<TInTable, TInValue>,
	outOptions: RecordIdTypeOptions<TOutTable, TOutValue>,
): RelationRecordType<
	TTable,
	TValue,
	TInTable,
	TInValue,
	TOutTable,
	TOutValue
> =>
	z.object({
		id: recordIdType(options),
		in: recordIdType(inOptions),
		out: recordIdType(outOptions),
	});

/**
 * The Zod schema for a record. This type is returned by the {@link record} function.
 */
export type RecordType<
	TTable extends string,
	TId extends RecordIdValue,
> = z.ZodObject<{ id: RecordIdType<TTable, TId> }>;

/**
 * The Zod schema for a relation record. This type is returned by the {@link relationRecord} function.
 */
export type RelationRecordType<
	TTable extends string,
	TValue extends RecordIdValue,
	TInTable extends string,
	TInValue extends RecordIdValue,
	TOutTable extends string,
	TOutValue extends RecordIdValue,
> = z.ZodObject<{
	id: RecordIdType<TTable, TValue>;
	in: RecordIdType<TInTable, TInValue>;
	out: RecordIdType<TOutTable, TOutValue>;
}>;
