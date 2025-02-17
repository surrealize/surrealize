import type { EventEmitter } from "./connection/emitter.ts";
import {
	AbstractEngine,
	type EmitterEvents,
	type EngineInitializer,
} from "./connection/engine.ts";
import { WebSocketEngine } from "./connection/engines/ws.ts";
import { DatabaseError, QueryError } from "./connection/error.ts";
import type { RpcRequest, RpcResponse } from "./connection/rpc.ts";
import type { Auth } from "./connection/types.ts";
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

	namespace?: string;
	database?: string;
	auth?: Auth;

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

	/**
	 * The timeout in milliseconds for the connection.
	 */
	timeout?: number;
};

export class Surrealize {
	static default: Surrealize | undefined = undefined;

	readonly #engine: AbstractEngine;
	readonly emitter: EventEmitter<EmitterEvents>;

	constructor(options: SurrealizeOptions) {
		const engines: Record<string, EngineInitializer> = options.engines ?? {
			ws: (ctx) => new WebSocketEngine(ctx),
			wss: (ctx) => new WebSocketEngine(ctx),
		};
		const url = options.url instanceof URL ? options.url : new URL(options.url);

		const protocol = url.protocol.replace(":", "");
		const engine = engines[protocol];

		if (!engine) throw new Error(`Unsupported protocol ${protocol}`);

		this.#engine = engine({
			url,
			namespace: options.namespace,
			database: options.database,
			auth: options.auth,
			timeout: options.timeout,
		});
		this.emitter = this.#engine.emitter;

		if (options.default) Surrealize.default = this;
	}

	async connect(): Promise<void> {
		return this.#engine.connect();
	}

	async disconnect(): Promise<void> {
		return this.#engine.disconnect();
	}

	async version(): Promise<string> {
		return this.#engine.version();
	}

	async execute<TSchemaOutput>(
		queryLike: QueryLike<TSchemaOutput>,
	): Promise<TSchemaOutput> {
		const { template, schema } = resolveQuery(queryLike);
		const { query, bindings } = prepareQuery(template);

		const [result] = await this.query(query, bindings);

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

		const results = await this.query(query, bindings);

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

	async rpc<TResult>(request: RpcRequest): Promise<RpcResponse<TResult>> {
		return this.#engine.rpc(request);
	}

	async query<TResult extends unknown[]>(
		query: string,
		bindings?: Record<string, unknown>,
	): Promise<TResult> {
		const response = await this.rpc<
			Array<{ result: unknown; status: "OK" | "ERR"; time: string }>
		>({
			method: "query",
			params: [query, bindings],
		});

		if (response.result) {
			const error = response.result.find((query) => query.status === "ERR");
			if (error) throw new QueryError(error.result as string);

			return response.result.map((query) => query.result) as TResult;
		} else {
			throw new DatabaseError(response.error);
		}
	}
}
