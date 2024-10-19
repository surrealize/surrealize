import type { AnySchemaOutput } from "../utils/schema";
import type { QueryBuilder, RawQuery } from "./builder";
import type { Query } from "./query";

/**
 * A compiled query which can be consumed by the `surrealdb` library.
 */
export type CompiledQuery = {
	query: string;
	bindings?: Record<string, unknown>;
};

/**
 * A queryable is an object which has the {@link QueryBuilder.toQuery} symbol.
 *
 * This property returns a {@link Query} or a {@link RawQuery}.
 */
export type Queryable<TSchemaOutput = AnySchemaOutput> = Record<
	typeof QueryBuilder.toQuery,
	() => Query<TSchemaOutput> | RawQuery
>;

/**
 * A query like type which can be a {@link Query} or a {@link Queryable}.
 */
export type QueryLike<TSchemaOutput = AnySchemaOutput> =
	| Query<TSchemaOutput>
	| Queryable<TSchemaOutput>;

/**
 * This is a list of ${@link QueryLike} objects.
 */
export type QueriesLike<TSchemaOutput = AnySchemaOutput> =
	QueryLike<TSchemaOutput>[];

/**
 * Infer the output type of a {@link QueryLike} object.
 */
export type InferQueryOutput<TQuery extends QueryLike> =
	TQuery extends QueryLike<infer TSchemaOutput> ? TSchemaOutput : never;

/**
 * Infer the output type of a list of {@link QueryLike} objects.
 */
export type InferQueriesOutput<TQueries extends QueriesLike> = {
	[Index in keyof TQueries]: InferQueryOutput<TQueries[Index]>;
};
