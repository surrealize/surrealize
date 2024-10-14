import {
	RecordId as SurrealRecordId,
	type RecordIdValue as SurrealRecordIdValue,
} from "surrealdb";

import {
	type Encodeable,
	Transformer,
} from "../query/transformer/transformer.ts";
import type { SchemaLike } from "../schema/types.ts";
import { Surrealize } from "../surrealize.ts";
import { Table, type TableLike } from "./table.ts";

/**
 * The value type of a the id part of a record id.
 */
export type RecordIdValue = SurrealRecordIdValue;

/**
 * A type which represents multiple way of specifying a record id.
 *
 * Including the {@link RecordId} itself and a string representation of the record id.
 */
export type RecordIdLike<
	TTable extends string = string,
	TId extends RecordIdValue = RecordIdValue,
> =
	| RecordId<TTable, TId>
	| `${TTable}:${Extract<TId, string | number | bigint>}`;

/**
 * The record id is the primary key of a record in SurrealDB and is used to identify a record.
 *
 * It consists of the table name and an arbitrary id value.
 */
export class RecordId<
	TTable extends string = string,
	TId extends RecordIdValue = RecordIdValue,
> implements Encodeable<SurrealRecordId>
{
	readonly #native: SurrealRecordId<TTable>;

	constructor(
		readonly table: TTable,
		readonly id: TId,
	) {
		this.#native = new SurrealRecordId(table, id);
	}

	[Transformer.encoder]() {
		return this.#native;
	}

	/**
	 * Checks if the record id is equal to another record id.
	 *
	 * @param recordId The record id to compare with.
	 * @returns True if the record ids are equal, false otherwise.
	 */
	equals(recordId: RecordId): recordId is RecordId<TTable, TId> {
		return this.toString() === recordId.toString();
	}

	/**
	 * Get the table of the record id.
	 *
	 * @returns The table of the record id.
	 */
	getTable(): Table<TTable> {
		return new Table(this.table);
	}

	/**
	 * Get the string representation of the record id.
	 *
	 * @returns The string representation of the record id.
	 */
	toString(): string {
		return this.#native.toString();
	}

	/**
	 * Resolve the actual associated record of the record id using a surrealize connection.
	 *
	 * @param options The options to resolve the record.
	 * @returns The resolved record.
	 */
	async resolve<TOutput = unknown>(
		options: {
			/**
			 * The surrealize connection to use for resolving the record.
			 *
			 * If not provided, the default connection will be used (if set).
			 */
			connection?: Surrealize;

			/**
			 * The schema to use for validating the resolved record.
			 */
			schema?: SchemaLike<TOutput>;
		} = {},
	) {
		const connection = options.connection ?? Surrealize.default;
		if (!connection) throw new Error("No connection provided.");

		return connection.resolve(this, options.schema);
	}

	/**
	 * Instantiate a record id from a table and id.
	 *
	 * @example
	 * ```ts
	 * const rid1 = RecordId.from("user", "bob");
	 * const rid2 = RecordId.from(Table.from("user"), "bob");
	 * const rid3 = RecordId.from("sensor", ["SENSOR_1", new Date()]);
	 * ```
	 *
	 * @param table The table of the record id.
	 * @param id The id of the record id.
	 * @returns The instantiated record id.
	 */
	static from<const TTable extends string, const TId extends RecordIdValue>(
		table: TableLike<TTable>,
		id: TId,
	): RecordId<TTable, TId>;

	/**
	 * Instantiate a record id from a record id like input.
	 *
	 * @example
	 * ```ts
	 * const rid = RecordId.from("user:bob");
	 * ```
	 *
	 * @param recordId The record id like input.
	 * @returns The instantiated record id.
	 */
	static from<const TTable extends string, const TId extends RecordIdValue>(
		recordId: RecordIdLike<TTable, TId>,
	): RecordId<TTable, TId>;

	static from<const TTable extends string, const TId extends RecordIdValue>(
		tableOrId: TableLike<TTable> | RecordIdLike<TTable, TId>,
		id?: TId,
	): RecordId<TTable, TId> {
		if (id === undefined) {
			if (tableOrId instanceof RecordId) return tableOrId;

			const [table, id] = (tableOrId as string).split(":") as [TTable, TId];
			return new RecordId(table, id);
		}

		if (tableOrId instanceof RecordId) return tableOrId;

		const table = Table.from(tableOrId as TTable | Table<TTable>);
		return new RecordId(table.name, id);
	}
}
