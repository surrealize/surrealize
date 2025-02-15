import { Connection } from "./connection/connection.ts";
import type { EngineInitializer } from "./connection/engine.ts";
import { surql } from "./query/query.ts";
import type {
	InferQueriesOutput,
	QueriesLike,
	QueryLike,
} from "./query/types.ts";
import {
	prepareQuery,
	prepareTransaction,
	resolveQuery,
} from "./query/utils.ts";
import type { Schema } from "./schema/types.ts";
import { parseSchema } from "./schema/utils.ts";
import { RecordId } from "./type/recordid.ts";
import { type TargetLike, resolveTarget } from "./type/target.ts";

export type SurrealizeOptions = {
	url: URL | string;

	/**
	 * Set the connection as the default connection.
	 *
	 * This will make the Surrealize instance the default instance for all queries.
	 */
	default?: boolean;

	/**
	 * A collection of engines which are available to connect to.
	 *
	 * Defaults to the following engines:
	 * - `ws`: WebSocket
	 * - `wss`: WebSocket Secure
	 */
	engines?: Record<string, EngineInitializer>;
};

export class Surrealize {
	static default: Surrealize | undefined = undefined;

	/**
	 * The underlying SurrealDB connection to execute queries.
	 */
	connection: Connection;

	constructor(options: SurrealizeOptions) {
		this.connection = new Connection(
			{ url: options.url instanceof URL ? options.url : new URL(options.url) },
			{ engines: options.engines },
		);

		if (options.default) Surrealize.default = this;
	}

	async execute<TSchemaOutput>(
		queryLike: QueryLike<TSchemaOutput>,
	): Promise<TSchemaOutput> {
		const { template, schema } = resolveQuery(queryLike);
		const { query, bindings } = prepareQuery(template);

		const [result] = await this.connection.query(query, bindings);

		return (schema ? parseSchema(schema, result) : result) as TSchemaOutput;
	}

	async executeAll<const TQueries extends QueriesLike>(
		queriesLike: TQueries,
	): Promise<InferQueriesOutput<TQueries>> {
		return Promise.all(
			queriesLike.map((queryLike) =>
				this.execute(queryLike),
			) as InferQueriesOutput<TQueries>,
		);
	}

	async executeTransaction<const TQueries extends QueriesLike>(
		queriesLike: TQueries,
	): Promise<InferQueriesOutput<TQueries>> {
		const queries = queriesLike.map((queryLike) => resolveQuery(queryLike));

		const { query, bindings } = prepareTransaction(queries);

		const results = await this.connection.query(query, bindings);

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
		schema?: Schema<TOutput>,
	): Promise<TOutput> {
		const target = resolveTarget(targetLike);

		const query =
			target instanceof RecordId
				? surql`SELECT * FROM ONLY ${target}`
				: surql`SELECT * FROM ${target}`;

		return this.execute(query.withSchema(schema));
	}
}
