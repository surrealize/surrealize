import type { RawQuery } from "./builder/raw.ts";
import type { Query } from "./query.ts";

export type PreparedQuery = {
	query: string;
	bindings?: Record<string, unknown>;
};

/**
 * A queryable is an object which has a context containing the `toQuery` function.
 *
 * This function returns a {@link Query} or a {@link RawQuery}.
 */
export type Queryable<TSchemaOutput = unknown> = Record<
	"toQuery",
	() => Query<TSchemaOutput> | RawQuery
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
