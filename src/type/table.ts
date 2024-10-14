import type { SchemaContext } from "../schema/context.ts";
import type { RecordSchemaContext } from "./record.ts";
import { RecordId, type RecordIdValue } from "./recordid.ts";

export type InferTableFromSchema<TSchema extends SchemaContext> =
  TSchema extends RecordSchemaContext<infer TRecordId>
    ? TRecordId["table"]
    : string;

/**
 * A type which represents multiple way of specifying a table.
 *
 * Including the {@link Table} itself and a string representation of the table.
 */
export type TableLike<TTable extends string = string> = Table<TTable> | TTable;

/**
 * The table is a collection of records in SurrealDB.
 */
export class Table<TTable extends string = string> {
  constructor(readonly name: TTable) {}

  /**
   * Checks if the table is equal to another table.
   *
   * @param table The table to compare with.
   * @returns True if the tables are equal, false otherwise.
   */
  equals(table: Table): table is Table<TTable> {
    return this.name === table.name;
  }

  /**
   * Checks if a record id is belonging to the table.
   *
   * @param recordId The record id to check.
   * @returns True if record id belongs to the table, false otherwise.
   */
  contains(recordId: RecordId): boolean {
    return this.name === recordId.table;
  }

  /**
   * Create a record id which belongs to the table.
   *
   * @param id The id of the record id.
   * @returns A record id which belongs to the table.
   */
  getRecordId<TId extends RecordIdValue>(id: TId): RecordId<TTable, TId> {
    return new RecordId(this.name, id);
  }

  /**
   * Get the string representation of the table.
   *
   * This is simply the name of the table.
   *
   * @returns The string representation of the table.
   */
  toString(): string {
    return this.name;
  }

  /**
   * Instantiate a table from a table like input.
   *
   * @param table The table like input.
   * @returns The instantiated table.
   */
  static from<const TTable extends string>(
    table: TableLike<TTable>,
  ): Table<TTable> {
    if (table instanceof Table) return table;
    return new Table(table);
  }
}
