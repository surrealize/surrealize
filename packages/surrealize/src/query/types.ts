import type { QueryBuilder } from "./builder.ts";
import type { Query } from "./query.ts";

export const toQuery = Symbol("toQuery");
export const buildQuery = Symbol("buildQuery");

export type PreparedQuery = {
	query: string;
	bindings?: Record<string, unknown>;
};

/**
 * A queryable is an object which has the {@link toQuery} symbol.
 *
 * This property returns a {@link Query} or a {@link QueryBuilder}.
 */
export type Queryable<TSchemaOutput = unknown> = Record<
	typeof toQuery,
	() => Query<TSchemaOutput> | QueryBuilder
>;

/**
 * A query like type which can be a {@link Query} or a {@link Queryable}.
 */
export type QueryLike<TSchemaOutput = unknown> =
	| Query<TSchemaOutput>
	| Queryable<TSchemaOutput>;

/**
 * This is a list of ${@link QueryLike} objects.
 */
export type QueriesLike<TSchemaOutput = unknown> = QueryLike<TSchemaOutput>[];

/**
 * Infer the output type of a {@link QueryLike} object.
 */
export type InferQueryOutput<TQuery extends QueryLike> =
	TQuery extends QueryLike<infer TSchemaOutput> ? TSchemaOutput : never;

/**
 * Infer the output type of a list of {@link QueryLike} objects.
 */
export type InferQueriesOutput<TQueries extends QueriesLike> = {
	[Key in keyof TQueries]: InferQueryOutput<TQueries[Key]>;
};
