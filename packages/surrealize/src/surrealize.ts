import Surreal from "surrealdb";

import {
	prepareQuery,
	prepareTransaction,
	resolveQuery,
} from "./query/builder.ts";
import { surql } from "./query/query.ts";
import { DEFAULT_CODECS } from "./query/transformer/codecs.ts";
import { Transformer } from "./query/transformer/transformer.ts";
import type {
	InferQueriesOutput,
	QueriesLike,
	QueryLike,
} from "./query/types.ts";
import type { SchemaLike } from "./schema/types.ts";
import { parseSchema } from "./schema/utils.ts";
import { RecordId } from "./type/recordid.ts";
import { type TargetLike, resolveTarget } from "./type/target.ts";

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
	static default: Surrealize | undefined = undefined;

	/**
	 * The underlying SurrealDB connection to execute queries.
	 */
	connection: Surreal;

	/**
	 * The transformer to use for encoding and decoding values.
	 */
	transformer: Transformer;

	constructor(options: SurrealizeOptions = {}) {
		this.connection = options.surreal ?? new Surreal();
		this.transformer = options.transformer ?? new Transformer(DEFAULT_CODECS);

		if (options.default) Surrealize.default = this;
	}
	async execute<TSchemaOutput>(
		queryLike: QueryLike<TSchemaOutput>,
	): Promise<TSchemaOutput> {
		const { template, schema } = resolveQuery(queryLike);
		const { query, bindings } = prepareQuery(template, this.transformer);

		const [result] = await this.connection
			.query(query, bindings)
			.then((result) => result.map((value) => this.transformer.decode(value)));

		return (schema ? parseSchema(schema, result) : result) as TSchemaOutput;
	}

	async executeAll<TQueries extends QueriesLike>(
		queriesLike: TQueries,
	): Promise<InferQueriesOutput<TQueries>> {
		return Promise.all(
			queriesLike.map((queryLike) =>
				this.execute(queryLike),
			) as InferQueriesOutput<TQueries>,
		);
	}

	async executeTransaction<TQueries extends QueriesLike>(
		queriesLike: TQueries,
	): Promise<InferQueriesOutput<TQueries>> {
		const queries = queriesLike.map((queryLike) => resolveQuery(queryLike));

		const { query, bindings } = prepareTransaction(queries, this.transformer);

		const results = await this.connection
			.query(query, bindings)
			.then((result) => result.map((value) => this.transformer.decode(value)));

		return queries.map(({ schema }, index) => {
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

		const query =
			target instanceof RecordId
				? surql`SELECT * FROM ONLY ${target}`
				: surql`SELECT * FROM ${target}`;

		return this.execute(query.withSchema(schema));
	}
}
