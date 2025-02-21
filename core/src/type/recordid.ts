import type { StandardSchema } from "../schema/standard.ts";
import { Surrealize } from "../surrealize.ts";
import { Table, type TableLike } from "./table.ts";
import { UUID } from "./uuid.ts";

/**
 * The value type of a the id part of a record id.
 */
export type RecordIdValue =
	| string
	| number
	| bigint
	| UUID
	| unknown[]
	| Record<string, unknown>;

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
	TValue extends RecordIdValue = RecordIdValue,
> {
	constructor(
		readonly table: TTable,
		readonly value: TValue,
	) {}

	/**
	 * Checks if the record id is equal to another record id.
	 *
	 * @param recordId The record id to compare with.
	 * @returns True if the record ids are equal, false otherwise.
	 */
	equals(recordId: RecordId): recordId is RecordId<TTable, TValue> {
		return this.table === recordId.table && this.value === recordId.value;
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
	 * Resolve the actual associated record of the record id using a surrealize connection.
	 *
	 * @param options The options to resolve the record.
	 * @returns The resolved record.
	 */
	async resolve<TOutput>(
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
			schema?: StandardSchema<unknown, TOutput>;
		} = {},
	) {
		const connection = options.connection ?? Surrealize.default;
		if (!connection) throw new Error("No connection provided.");

		return connection.resolve(this, options.schema);
	}

	/**
	 * Instantiate a record id from a table and value.
	 *
	 * @example
	 * ```ts
	 * const rid1 = RecordId.from("user", "bob");
	 * const rid2 = RecordId.from(Table.from("user"), "bob");
	 * const rid3 = RecordId.from("sensor", ["SENSOR_1", new Date()]);
	 * ```
	 *
	 * @param table The table of the record id.
	 * @param value The value of the record id.
	 * @returns The instantiated record id.
	 */
	static from<const TTable extends string, const TValue extends RecordIdValue>(
		table: TableLike<TTable>,
		id: TValue,
	): RecordId<TTable, TValue>;

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
	static from<const TTable extends string, const TValue extends RecordIdValue>(
		recordId: RecordIdLike<TTable, TValue>,
	): RecordId<TTable, TValue>;

	static from<const TTable extends string, const TValue extends RecordIdValue>(
		tableOrValue: TableLike<TTable> | RecordIdLike<TTable, TValue>,
		value?: TValue,
	): RecordId<TTable, TValue> {
		if (value === undefined) {
			if (tableOrValue instanceof RecordId) return tableOrValue;

			const [table, value] = (tableOrValue as string).split(":") as [
				TTable,
				TValue,
			];
			return new RecordId(table, value);
		}

		if (tableOrValue instanceof RecordId) return tableOrValue;

		const table = Table.from(tableOrValue as TTable | Table<TTable>);
		return new RecordId(table.name, value);
	}
}
