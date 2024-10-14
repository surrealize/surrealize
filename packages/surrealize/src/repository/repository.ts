import type { SelectStatement } from "../builder/statement/select";
import { type Query, QueryList } from "../query/query";
import { Statements } from "../statements";
import type { Surrealize } from "../surrealize";
import type { Record } from "../type/record";
import { RecordId, type RecordIdLike } from "../type/recordid";
import { Table, type TableLike } from "../type/table";
import {
	type AnySchemaOutput,
	type SchemaLike,
	convertSchemaArray,
	convertSchemaUndefinable,
} from "../utils/schema";
import { convertFilterObjectToConditions } from "../utils/where";
import type {
	RepositoryFindByOptions,
	RepositoryFindOneByOptions,
	RepositoryFindOneOptions,
	RepositoryFindOptions,
	RepositoryFindWhere,
	RepositoryRawQueryOptions,
} from "./types";

export type RepositoryOptions<TRecord extends Record> = {
	connection?: Surrealize;
	schema?: SchemaLike<TRecord>;
};

/**
 * An repository is an easy to use interface to communicate with the database.
 *
 * It provides a simple and easy to use interface to create, update, delete and query records.
 */
export class Repository<
	TTable extends string,
	TRecord extends Record<TTable> = Record<TTable>,
> {
	readonly table: Table<TTable>;
	readonly options: RepositoryOptions<TRecord>;
	readonly q: Statements<TRecord>;

	constructor(
		table: TableLike<TTable>,
		options: RepositoryOptions<TRecord> = {},
	) {
		this.table = Table.from(table);
		this.options = options;
		this.q = new Statements({
			connection: options.connection,
			schema: options.schema,
		});
	}

	find(options: RepositoryFindOptions<TRecord> = {}): Query<TRecord[]> {
		return this._query({
			one: false,

			...options,

			schema: this.options.schema
				? convertSchemaArray(this.options.schema)
				: undefined,
		});
	}

	findBy(
		where: RepositoryFindWhere<TRecord>,
		options: RepositoryFindByOptions<TRecord> = {},
	): Query<TRecord[]> {
		return this._query({
			one: false,
			where,

			...options,

			schema: this.options.schema
				? convertSchemaArray(this.options.schema)
				: undefined,
		});
	}

	findOne(
		options: RepositoryFindOneOptions<TRecord> = {},
	): Query<TRecord | undefined> {
		return this._query({
			one: true,

			...options,

			schema: this.options.schema
				? convertSchemaUndefinable(this.options.schema)
				: undefined,
		});
	}

	findOneBy(
		where: RepositoryFindWhere<TRecord>,
		options: RepositoryFindOneByOptions<TRecord> = {},
	): Query<TRecord | undefined> {
		return this._query({
			one: true,
			where,

			...options,

			schema: this.options.schema
				? convertSchemaUndefinable(this.options.schema)
				: undefined,
		});
	}

	findById(
		id: RecordIdLike<TTable>,
		// options?: RepositoryFindByIdOptions<TRecord>,
	): Query<TRecord | undefined> {
		const recordId = RecordId.from(id);

		if (!this.table.contains(recordId))
			throw new Error(
				`The RecordId(${recordId.toString()}) is not part of the Table(${this.table.toString()})`,
			);

		return this._query({
			one: true,
			target: recordId,

			schema: this.options.schema
				? convertSchemaUndefinable(this.options.schema)
				: undefined,
		});
	}

	create(record: TRecord): Query<TRecord> {
		return this.q.createOnly(record.id).content(record).toQuery({
			schema: this.options.schema,
		});
	}

	createAll(records: TRecord[]): QueryList<Query<TRecord>[]> {
		return new QueryList(
			records.map((record) => this.create(record)),
			{ connection: this.options.connection },
		);
	}

	update(record: TRecord): Query<TRecord> {
		return this.q.updateOnly(record.id).content(record).toQuery({
			schema: this.options.schema,
		});
	}

	updateAll(records: TRecord[]): QueryList<Query<TRecord>[]> {
		return new QueryList(
			records.map((record) => this.update(record)),
			{ connection: this.options.connection },
		);
	}

	upsert(record: TRecord): Query<TRecord> {
		return this.q.upsertOnly(record.id).content(record).toQuery({
			schema: this.options.schema,
		});
	}

	upsertAll(records: TRecord[]): QueryList<Query<TRecord>[]> {
		return new QueryList(
			records.map((record) => this.upsert(record)),
			{ connection: this.options.connection },
		);
	}

	save(record: TRecord): Query<TRecord> {
		return this.upsert(record);
	}

	saveAll(records: TRecord[]): QueryList<Query<TRecord>[]> {
		return new QueryList(
			records.map((record) => this.save(record)),
			{ connection: this.options.connection },
		);
	}

	delete(record: TRecord): Query<undefined> {
		return this.deleteById(record.id);
	}

	deleteAll(records: TRecord[]): QueryList<Query<undefined>[]> {
		return new QueryList(
			records.map((record) => this.delete(record)),
			{ connection: this.options.connection },
		);
	}

	deleteById(id: RecordIdLike<TTable>): Query<undefined> {
		return this.q.delete(id).toQuery({
			// skip schema validation and always return undefined
			// because it deletes the record
			schema: () => undefined,
		});
	}

	/**
	 * Internally used method to build the queries for `find`-related methods.
	 *
	 * @param options The options to use for the query.
	 * @returns The query.
	 */
	private _query<TQuerySchemaOutput = AnySchemaOutput>(
		options: RepositoryRawQueryOptions<TQuerySchemaOutput>,
	): Query<TQuerySchemaOutput> {
		// build the query
		let query = (
			options.one
				? // if only one record should be returned, use `fromOnly` and limit to 1
					this.q
						.select()
						.fromOnly(options.target ?? this.table)
						.limit(1)
				: // else use normal `from`
					this.q.select().from(options.target ?? this.table)
		) as SelectStatement<object>;

		// apply where conditions
		if (options.where) {
			query = query.where(
				...(Array.isArray(options.where)
					? // when a conditions array is passed, use it as is
						options.where
					: // otherwise convert the filter object to conditions
						convertFilterObjectToConditions(options.where)),
			);
		}

		// apply limit (only if not a `one` query)
		if (options.limit && !options.one) query = query.limit(options.limit);

		// apply start
		if (options.start) query = query.start(options.start);

		// apply parallel
		if (options.parallel) query = query.parallel();

		// apply tempfiles
		if (options.tempfiles) query = query.tempfiles();

		// apply timeout
		if (options.timeout) query = query.timeout(options.timeout);

		return query.toQuery({
			// converts the schema to an array schema because we expect an array of results
			schema: options.schema,

			// use the connection from the repository
			connection: this.options.connection,
		});
	}
}
