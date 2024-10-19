import { Surreal } from "surrealdb";

import { QueryBuilder } from "./query/builder";
import { surql } from "./query/query";
import { DEFAULT_CODECS } from "./query/transform/codecs";
import { Transformer } from "./query/transform/transformer";
import type { InferQueriesOutput, QueriesLike, QueryLike } from "./query/types";
import { RecordId } from "./type/recordid";
import { type TargetLike, resolveTarget } from "./type/target";
import { type SchemaLike, parseSchema } from "./utils/schema";

export type SurrealizeOptions = {
	/**
	 * The underlying surrealdb connection.
	 */
	surreal?: Surreal;

	/**
	 * The transformer to use for encoding and decoding values.
	 */
	transformer?: Transformer;

	/**
	 * Set the connection as the default connection.
	 *
	 * This will make the Surrealize instance the default instance for all queries.
	 */
	default?: boolean;
};

export class Surrealize {
	static default: Surrealize | null = null;

	/**
	 * The underlying SurrealDB connection to execute queries.
	 */
	connection: Surreal;

	readonly transformer: Transformer;

	constructor(options: SurrealizeOptions = {}) {
		this.connection = options.surreal ?? new Surreal();
		this.transformer = options.transformer ?? new Transformer(DEFAULT_CODECS);

		if (options.default) Surrealize.default = this;
	}

	/**
	 * Execute a single query and return the result.
	 *
	 * If a validator is provided, it will be used to validate the result.
	 *
	 * @param query The query to execute.
	 * @returns The result of the query.
	 */
	async execute<TSchemaOutput>(
		queryLike: QueryLike<TSchemaOutput>,
	): Promise<TSchemaOutput> {
		const { template, schema } = QueryBuilder.resolveQuery(queryLike);
		const { query, bindings } = QueryBuilder.createQuery(template);

		const [result] = await this.connection
			.query(query, bindings)
			.then((result) => result.map((value) => this.transformer.decode(value)));

		return (schema ? parseSchema(schema, result) : result) as TSchemaOutput;
	}

	/**
	 * Execute multiple queries and return the results.
	 *
	 * This method internally uses the `execute` method and `Promise.all` to execute the queries.
	 *
	 * @param queries The queries to execute.
	 * @returns The results of the queries.
	 */
	async executeAll<TQueries extends QueriesLike>(
		queries: TQueries,
	): Promise<InferQueriesOutput<TQueries>> {
		return Promise.all(
			queries.map((query) =>
				this.execute(query),
			) as InferQueriesOutput<TQueries>,
		);
	}

	/**
	 * Execute multiple queries in a transaction and return the results.
	 *
	 * Similar to `executeAll` but wraps the queries in a transaction.
	 *
	 * @param queries The queries to execute in a transaction.
	 * @returns The results of the queries.
	 */
	async executeTransaction<TQueries extends QueriesLike>(
		queries: TQueries,
	): Promise<InferQueriesOutput<TQueries>> {
		const resolvedQueries = queries.map((query) =>
			QueryBuilder.resolveQuery(query),
		);

		const { query, bindings } = QueryBuilder.createTransaction(
			resolvedQueries.map((inner) => inner.template),
		);

		// query surrealdb
		const results = await this.connection
			.query(query, bindings)
			.then((result) => result.map((value) => this.transformer.decode(value)));

		// run validators on the results
		return resolvedQueries.map(({ schema }, index) => {
			const queryResult = results[index];
			return schema ? parseSchema(schema, queryResult) : queryResult;
		}) as InferQueriesOutput<TQueries>;
	}

	/**
	 * Get a specific target from the database. A target can be a record id or a table.
	 * In case the target is a table, the result will be an array of records.
	 *
	 * @param targetLike A target like input (record id or table).
	 * @param schema The optional schema to use for validating the result.
	 * @returns The target from the database.
	 */
	async resolve<TOutput>(
		targetLike: TargetLike,
		schema?: SchemaLike<TOutput>,
	): Promise<TOutput> {
		const target = resolveTarget(targetLike);

		if (target instanceof RecordId)
			return this.execute(surql`SELECT * FROM ONLY ${target}`.with(schema));

		return this.execute(surql`SELECT * FROM ${target}`.with(schema));
	}
}
