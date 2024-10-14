import type { AbstractEngine } from "./connection/engine.ts";
import { DatabaseError, QueryError } from "./connection/error.ts";
import type { RpcRequest } from "./connection/types.ts";
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
import { type StandardSchema, parseSchema } from "./schema/standard.ts";
import { RecordId } from "./type/recordid.ts";
import { type TargetLike, resolveTarget } from "./type/target.ts";

export type SurrealizeOptions = {
  /**
   * Set the connection as the default connection.
   *
   * This will make the Surrealize instance the default instance for all queries.
   */
  default?: boolean;
};

export class Surrealize {
  static default: Surrealize | undefined = undefined;

  readonly engine: AbstractEngine;
  readonly options: SurrealizeOptions;

  constructor(engine: AbstractEngine, options: SurrealizeOptions = {}) {
    this.engine = engine;
    this.options = options;

    if (options.default) Surrealize.default = this;
  }

  async connect(): Promise<void> {
    return this.engine.connect();
  }

  async disconnect(): Promise<void> {
    return this.engine.disconnect();
  }

  async version(): Promise<string> {
    return this.engine.version();
  }

  async execute<TOutput = unknown>(
    queryLike: QueryLike<TOutput>,
  ): Promise<TOutput> {
    const { template, schema } = resolveQuery(queryLike);
    const { query, bindings } = prepareQuery(template);

    const [result] = await this.query(query, bindings);

    return (schema ? await parseSchema(schema, result) : result) as TOutput;
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

    const parsedPromises = queries.map(async ({ schema }, index) => {
      const queryResult = results[index];
      return schema ? await parseSchema(schema, queryResult) : queryResult;
    });

    return Promise.all(parsedPromises) as Promise<InferQueriesOutput<TQueries>>;
  }

  /**
   * Get a specific target from the database. A target can be a record id or a table.
   * In case the target is a table, the result will be an array of records.
   *
   * @param targetLike A target like input (record id or table).
   * @param schema The optional schema to use for validating the result.
   * @returns The target from the database.
   */
  async resolve<TOutput = unknown>(
    targetLike: TargetLike,
    schema?: StandardSchema<unknown, TOutput>,
  ): Promise<TOutput> {
    const target = resolveTarget(targetLike);

    const query =
      target instanceof RecordId
        ? surql`SELECT * FROM ONLY ${target}`
        : surql`SELECT * FROM ${target}`;

    return this.execute(query.withSchema(schema));
  }

  async query<TResult extends unknown[]>(
    query: string,
    bindings?: Record<string, unknown>,
  ): Promise<TResult> {
    const request: RpcRequest = {
      method: "query",
      params: [query, bindings],
    };

    const response =
      await this.engine.rpc<
        Array<{ result: unknown; status: "OK" | "ERR"; time: string }>
      >(request);

    if (response.result) {
      const error = response.result.find((query) => query.status === "ERR");
      if (error) throw new QueryError(error.result as string);

      return response.result.map((query) => query.result) as TResult;
    } else {
      throw new DatabaseError(response.error, request);
    }
  }
}
