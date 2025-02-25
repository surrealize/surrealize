import type { CborType } from "@std/cbor";

import { Duration } from "../../type/duration.ts";
import { RecordId, type RecordIdValue } from "../../type/recordid.ts";
import { Table } from "../../type/table.ts";
import type { TagCodec } from "./cbor.ts";

export const TAG_NONE: TagCodec<undefined, null> = {
	tag: 6,
	isApplicable: (value) => value === undefined,
	encode: () => null,
	decode: () => undefined,
};

export const TAG_TABLE: TagCodec<Table, string> = {
	tag: 7,
	isApplicable: (value) => value instanceof Table,
	encode: (table) => table.name,
	decode: (value) => Table.from(value),
};

export const TAG_RECORD_ID: TagCodec<RecordId, [string, CborType]> = {
	tag: 8,
	isApplicable: (value) => value instanceof RecordId,
	encode: (id, encode) => [id.table, encode(id.value)],
	decode: ([table, value], decode) =>
		new RecordId(table, decode<RecordIdValue>(value)),
};

export const TAG_DATETIME: TagCodec<Date, [s: number, ns: number]> = {
	tag: 12,
	isApplicable: (value) => value instanceof Date,
	encode: (date) => [
		Math.floor(date.getTime() / 1000),
		(date.getTime() % 1000) * 1000000,
	],
	decode: ([s, ns]) => new Date(s * 1000 + ns / 1000000),
};

export const TAG_DURATION: TagCodec<
	Duration,
	[seconds: bigint | undefined, nanoseconds: bigint | undefined]
> = {
	tag: 14,
	isApplicable: (value) => value instanceof Duration,
	encode: (duration) => [
		duration.nanoseconds / 1000000000n,
		duration.nanoseconds % 1000000000n,
	],
	decode: ([seconds, nanoseconds]) =>
		new Duration(
			BigInt(seconds ?? 0n) * 1000000000n + BigInt(nanoseconds ?? 0n),
		),
};

export const tags: TagCodec<any, any>[] = [
	TAG_NONE,
	TAG_TABLE,
	TAG_RECORD_ID,
	TAG_DATETIME,
	TAG_DURATION,
];
