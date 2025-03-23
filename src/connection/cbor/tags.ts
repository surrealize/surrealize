import {
	type CborItem,
	type CborText,
	type Decoder,
	type Encoder,
	Simple,
} from "cborkit";
import {
	type ClassTransformer,
	createClassTransformer,
} from "cborkit/plugins/class_transformer";

import { Duration } from "../../type/duration.ts";
import { RecordId, type RecordIdValue } from "../../type/recordid.ts";
import { Table } from "../../type/table.ts";

export const TYPE_NONE: { encoder: Encoder; decoder: Decoder } = {
	encoder: {
		undefined: () => ({
			type: "tag",
			value: 6,
			item: { type: "simple", value: Simple.null.value },
		}),
	},

	decoder: {
		tag: (tag, next) => (tag.value === 6 ? undefined : next()),
	},
};

export const TAG_TABLE = createClassTransformer<Table, CborText>({
	target: Table,
	tag: 7,
	encode: (table) => ({ type: "text", value: table.name }),
	decode: ({ value }) => new Table(value),
});

export const TAG_RECORD_ID = createClassTransformer<RecordId, CborItem>({
	target: RecordId,
	tag: 8,
	encode: (id, encode) => encode([id.table, id.value]),
	decode: (value, decode) => {
		const [table, id] = decode(value) as [string, RecordIdValue];
		return new RecordId(table, id);
	},
});

export const TAG_DATETIME = createClassTransformer({
	target: Date,
	tag: 12,
	encode: (date, encode) => {
		const time = date.getTime();
		return encode([Math.floor(time / 1000), (time % 1000) * 1000000]);
	},
	decode: (value, decode) => {
		const [s, ns] = decode(value) as [number, number];
		return new Date(s * 1000 + ns / 1000000);
	},
});

export const TAG_DURATION = createClassTransformer({
	target: Duration,
	tag: 14,
	encode: (duration, encode) => {
		return encode([
			duration.nanoseconds / 1000000000n,
			duration.nanoseconds % 1000000000n,
		]);
	},
	decode: (value, decode) => {
		const [seconds, nanoseconds] = decode(value) as [
			bigint | undefined,
			bigint | undefined,
		];
		return new Duration(
			BigInt(seconds ?? 0n) * 1000000000n + BigInt(nanoseconds ?? 0n),
		);
	},
});

export const tags: ClassTransformer[] = [
	TAG_TABLE,
	TAG_RECORD_ID,
	TAG_DATETIME,
	TAG_DURATION,
];
