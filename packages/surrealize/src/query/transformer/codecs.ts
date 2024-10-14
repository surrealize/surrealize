import {
	Duration as SurrealDuration,
	RecordId as SurrealRecordId,
	Table as SurrealTable,
} from "surrealdb";

import { Duration } from "../../type/duration.ts";
import { RecordId } from "../../type/recordid.ts";
import { Table } from "../../type/table.ts";
import type { TransformerCustomType } from "./transformer.ts";

const recordId: TransformerCustomType<RecordId, SurrealRecordId> = {
	decode: {
		check: (value) => value instanceof SurrealRecordId,
		transform: (value) => new RecordId(value.tb, value.id),
	},
};

const table: TransformerCustomType<Table, SurrealTable> = {
	decode: {
		check: (value) => value instanceof SurrealTable,
		transform: (value) => new Table(value.tb),
	},
};

const duration: TransformerCustomType<Duration, SurrealDuration> = {
	decode: {
		check: (value) => value instanceof SurrealDuration,
		transform: (value) => new Duration(BigInt(value.nanoseconds)),
	},
};

/**
 * The default codecs used by the {@link Transformer}.
 *
 * This includes all built-in types like {@link RecordId} or {@link Table}.
 */
export const DEFAULT_CODECS: TransformerCustomType[] = [
	recordId,
	table,
	duration,
] as TransformerCustomType[];
