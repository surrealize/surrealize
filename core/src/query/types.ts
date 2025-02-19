import type { Schema, UnknownSchema } from "../schema/types.ts";
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
export type Queryable<TSchema extends Schema = UnknownSchema> = Record<
	"toQuery",
	() => Query<TSchema> | RawQuery
>;

/**
 * A query like type which can be a {@link Query} or a {@link Queryable}.
 */
export type QueryLike<TSchema extends Schema = UnknownSchema> =
	| Query<TSchema>
	| Queryable<TSchema>;

/**
 * This is a list of ${@link QueryLike} objects.
 */
export type QueriesLike<TSchema extends Schema = UnknownSchema> =
	QueryLike<TSchema>[];

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
