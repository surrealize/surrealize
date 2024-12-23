import * as Surreal from "surrealdb";

import { Duration } from "../../type/duration.ts";
import { RecordId } from "../../type/recordid.ts";
import { Table } from "../../type/table.ts";
import { UUID } from "../../type/uuid.ts";
import type { TransformerCustomType } from "./transformer.ts";

const recordId: TransformerCustomType<RecordId, Surreal.RecordId> = {
	encode: {
		check: (id) => id instanceof RecordId,
		transform: (id, transformer) =>
			new Surreal.RecordId(id.table, transformer.encode(id.value)),
	},
	decode: {
		check: (value) => value instanceof Surreal.RecordId,
		transform: (value, transformer) =>
			new RecordId(value.tb, transformer.decode(value.id)),
	},
};

const table: TransformerCustomType<Table, Surreal.Table> = {
	encode: {
		check: (value) => value instanceof Table,
		transform: (value) => new Surreal.Table(value.name),
	},
	decode: {
		check: (value) => value instanceof Surreal.Table,
		transform: (value) => new Table(value.tb),
	},
};

const duration: TransformerCustomType<Duration, Surreal.Duration> = {
	encode: {
		check: (value) => value instanceof Duration,
		transform: (value) =>
			new Surreal.Duration(
				Number(value.nanoseconds) / 1_000_000 /* ns -> ms */,
			),
	},
	decode: {
		check: (value) => value instanceof Surreal.Duration,
		transform: (value) => new Duration(BigInt(value.nanoseconds)),
	},
};

const uuid: TransformerCustomType<UUID, Surreal.Uuid> = {
	encode: {
		check: (value) => value instanceof UUID,
		transform: (value) => new Surreal.Uuid(value.bytes),
	},
	decode: {
		check: (value) => value instanceof Surreal.Uuid,
		transform: (value) => new UUID(value.toUint8Array()),
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
	uuid,
] as TransformerCustomType[];
