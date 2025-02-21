import { type Query } from "../query/query.ts";
import {
	alwaysTo,
	asArraySchema,
	withUndefinedSchema,
} from "../schema/common.ts";
import type { InferInput, InferResult } from "../schema/context.ts";
import type { ContentLike, SetLike } from "../statement/shared/data.ts";
import type { WhereCondition } from "../statement/shared/where.ts";
import { type DefaultBuilder, createDefaultBuilder } from "../statements.ts";
import type { Surrealize } from "../surrealize.ts";
import type {
	OptionalId,
	RecordSchemaContext,
	RequiredId,
} from "../type/record.ts";
import type { RecordId, RecordIdLike } from "../type/recordid.ts";
import {
	type InferTableFromSchema,
	Table,
	type TableLike,
} from "../type/table.ts";
import type {
	RepositoryFindByOptions,
	RepositoryFindOneByOptions,
	RepositoryRawQueryOptions,
	RepositoryWhere,
} from "./types.ts";
import { convertFilterObjectToConditions } from "./utils.ts";

export type RepositoryOptions<TSchema extends RecordSchemaContext> = {
	connection?: Surrealize;
	schema?: TSchema;
};

/**
 * An repository is an easy to use interface to communicate with the database.
 *
 * It provides a simple and easy to use interface to create, update, delete and query records.
 */
export class Repository<
	TTable extends string,
	TSchema extends RecordSchemaContext<RecordId<TTable>>,
> {
	readonly table: Table<InferTableFromSchema<TSchema>>;
	readonly q: DefaultBuilder<TSchema>;
	readonly schema?: TSchema;
	readonly connection?: Surrealize;

	constructor(
		table: TableLike<TTable>,
		options: RepositoryOptions<TSchema> = {},
	) {
		this.table = Table.from(table) as Table<InferTableFromSchema<TSchema>>;

		this.schema = options.schema;
		this.connection = options.connection;

		this.q = createDefaultBuilder({
			schema: this.schema,
			connection: this.connection,
		});
	}

	find(options?: RepositoryFindByOptions): Query<InferResult<TSchema>[]> {
		return this.findBy(undefined, options);
	}

	findBy(
		where?: RepositoryWhere<TSchema>,
		options?: RepositoryFindByOptions,
	): Query<InferResult<TSchema>[]> {
		return this.query({
			one: false,
			where,
			...options,
		});
	}

	findOneBy(
		where: RepositoryWhere<TSchema>,
		options?: RepositoryFindOneByOptions,
	): Query<InferResult<TSchema> | undefined> {
		return this.query({
			one: true,
			where,
			...options,
			schema: withUndefinedSchema(this.schema?.result),
		}) as Query<InferResult<TSchema> | undefined>;
	}

	findById(
		id: RecordIdLike<InferTableFromSchema<TSchema>>,
	): Query<InferResult<TSchema> | undefined> {
		return this.q
			.select()
			.fromOnly(id)
			.toQuery()
			.withSchema(withUndefinedSchema(this.schema?.result)) as Query<
			InferResult<TSchema> | undefined
		>;
	}

	create(record: OptionalId<InferInput<TSchema>>): Query<InferResult<TSchema>> {
		return this.q
			.createOnly(record.id ? record.id : this.table)
			.content(record as ContentLike<TSchema>)
			.toQuery();
	}

	// TODO nice types
	// createMany<TRecords extends readonly InferSchemaInput<TSchema>[]>(
	// 	records: TRecords,
	// ): QueryList<{
	// 	readonly [Key in keyof TRecords]: InferResult<TSchema>;
	// }> {
	// 	return undefined!;
	// }

	update(
		record: RequiredId<InferResult<TSchema>>,
	): Query<InferResult<TSchema>> {
		return this.q
			.updateOnly(record.id)
			.content(record as ContentLike<TSchema>)
			.toQuery();
	}

	updateBy(
		where: RepositoryWhere<TSchema>,
		set: SetLike<TSchema>,
	): Query<InferResult<TSchema>[]> {
		return this.q
			.update(this.table)
			.set(set)
			.where(this.getWhereConditions(where))
			.toQuery()
			.withSchema(asArraySchema(this.schema?.result)) as Query<
			InferResult<TSchema>[]
		>;
	}

	updateById(
		id: RecordIdLike<InferTableFromSchema<TSchema>>,
		set: SetLike<TSchema>,
	): Query<InferResult<TSchema>> {
		return this.q.update(id).set(set).toQuery();
	}

	// TODO same as createMany
	// updateMany

	upsert(record: RequiredId<InferInput<TSchema>>): Query<InferResult<TSchema>> {
		return this.q
			.upsertOnly(record.id)
			.content(record as ContentLike<TSchema>)
			.toQuery();
	}

	upsertBy(
		where: RepositoryWhere<TSchema>,
		set: SetLike<TSchema>,
	): Query<InferResult<TSchema>[]> {
		return this.q
			.upsert(this.table)
			.set(set)
			.where(this.getWhereConditions(where))
			.toQuery()
			.withSchema(asArraySchema(this.schema?.result)) as Query<
			InferResult<TSchema>[]
		>;
	}

	// TODO same as createMany
	// upsertMany<TRecords extends readonly InferSchemaInput<TSchema>[]>(

	delete(
		record: RequiredId<InferInput<TSchema>>,
	): Query<InferResult<TSchema> | undefined> {
		return this.q
			.deleteOnly(record.id)
			.toQuery()
			.withSchema(alwaysTo(undefined));
	}

	deleteBy(where: RepositoryWhere<TSchema>): Query<undefined> {
		return this.q
			.delete(this.table)
			.where(this.getWhereConditions(where))
			.toQuery()
			.withSchema(alwaysTo(undefined));
	}

	deleteById(
		id: RecordIdLike<InferTableFromSchema<TSchema>>,
	): Query<undefined> {
		return this.q.deleteOnly(id).toQuery().withSchema(alwaysTo(undefined));
	}

	// deleteMany() {}

	private getWhereConditions(
		where: RepositoryWhere<TSchema>,
	): WhereCondition<TSchema>[] {
		if (Array.isArray(where)) {
			// when a conditions array is passed, use it as is
			return where as WhereCondition<TSchema>[];
		} else {
			// otherwise convert the filter object to conditions
			return convertFilterObjectToConditions(
				where,
			) as WhereCondition<TSchema>[];
		}
	}

	/**
	 * Internally used method to build the queries for `find`-related methods.
	 *
	 * @param options The options to use for the query.
	 * @returns The query.
	 */
	private query<TOutput = InferResult<TSchema>>(
		options: RepositoryRawQueryOptions<TSchema, TOutput>,
	): Query<TOutput> {
		const baseQuery = options.one
			? this.q.select().fromOnly(options.target ?? this.table)
			: this.q.select().from(options.target ?? this.table);

		const query = baseQuery
			.where(options.where ? this.getWhereConditions(options.where) : undefined)
			.limit(options.one ? 1 : options.limit)
			.start(options.start)
			.timeout(options.timeout)
			.parallel(options.parallel === true)
			.tempfiles(options.tempfiles === true);

		return query.toQuery().withSchema(options.schema) as Query<TOutput>;
	}
}
