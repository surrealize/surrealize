import type { AnySchemaOutput } from "../utils/schema";
import {
	type TaggedTemplate,
	format,
	isEmpty,
	merge,
	tag,
} from "../utils/template";
import { Query, type QueryOptions } from "./query";
import { DEFAULT_CODECS } from "./transform/codecs";
import { Transformer } from "./transform/transformer";
import type { CompiledQuery, QueryLike } from "./types";

export class RawQuery {
	#query: TaggedTemplate;

	/**
	 * Initialize a new query builder.
	 *
	 * @param initialQuery An initial optional {@link TaggedTemplate} to start with.
	 */
	constructor(initialQuery?: TaggedTemplate) {
		this.#query = initialQuery ?? tag``;
	}

	/**
	 * Append a {@link TaggedTemplate} to the query.
	 *
	 * @param query The {@link TaggedTemplate} to append.
	 * @param join The join string to use between the queries.
	 * @returns The query builder (`this`).
	 */
	append(query: TaggedTemplate, join = " "): RawQuery {
		// skip appending if the template is empty
		if (isEmpty(query)) return this;

		this.#query = merge([this.#query, query], join);
		return this;
	}

	/**
	 * Get the raw representation of the query as {@link TaggedTemplate}.
	 *
	 * @returns The raw query as {@link TaggedTemplate}.
	 */
	get(): TaggedTemplate {
		return this.#query;
	}

	/**
	 * Convert the query to a {@link Query} object which can be executed.
	 *
	 * @param options The options to use for the query.
	 * @returns The query.
	 */
	toQuery<TSchemaOutput = AnySchemaOutput>(
		options: QueryOptions<TSchemaOutput> = {},
	): Query<TSchemaOutput> {
		return new Query(this.get(), options);
	}
}

export namespace QueryBuilder {
	export const toQuery: unique symbol = Symbol("QueryBuilder.toQuery");
	export const buildQuery: unique symbol = Symbol("QueryBuilder.buildQuery");

	/**
	 * Resolve a {@link QueryLike} object to a actual {@link Query}.
	 *
	 * @param query The query like object to resolve.
	 * @returns The resolved query.
	 */
	export const resolveQuery = <TOutput>(
		query: QueryLike<TOutput>,
	): Query<TOutput> => {
		if (QueryBuilder.toQuery in query) {
			const toQueryValue = query[QueryBuilder.toQuery]();

			if (toQueryValue instanceof RawQuery) {
				return toQueryValue.toQuery();
			}

			return toQueryValue;
		}

		return query;
	};

	/**
	 * Convert a tagged template query to a compiled query by replacing variables with bindings.
	 *
	 * Also encode the variables to their surrealdb.js representation if possible.
	 *
	 * @param query The tagged template to convert.
	 * @returns The compiled query (including the query string and the bindings object).
	 */
	export const createQuery = (
		query: TaggedTemplate,
		transformer: Transformer = new Transformer(DEFAULT_CODECS),
	): CompiledQuery => {
		const normalizedQuery = stripLastSemicolon(query);
		const formattedQuery = format(normalizedQuery, (_, index) => `$_${index}`);
		const bindings = Object.fromEntries(
			normalizedQuery[1].map(
				(value, index) => [`_${index}`, transformer.encode(value)] as const,
			),
		);

		return { query: formattedQuery, bindings };
	};

	/**
	 * Convert a tagged template query list to a compiled query by replacing variables with bindings and wrapping it in a transaction.
	 *
	 * Also encode the variables to their surrealdb.js representation if possible.
	 *
	 * @param queries The tagged template queries to convert and wrap in a transaction.
	 * @returns The compiled query (including the query string and the bindings object) as a transaction.
	 */
	export const createTransaction = (queries: TaggedTemplate[]) => {
		return QueryBuilder.createQuery(
			merge([
				merge(
					// wrap the queries in a transaction
					[tag`BEGIN`, ...queries, tag`COMMIT`],
					";\n",
				),
				tag`;`,
			]),
		);
	};

	/**
	 * Strip the last semicolon from a tagged template query.
	 *
	 * @param query The tagged template query to strip the last semicolon from.
	 * @returns The tagged template query without an ending semicolon.
	 */
	const stripLastSemicolon = (query: TaggedTemplate): TaggedTemplate => {
		return [
			query[0].map((sequence, index, array) => {
				// check if it is the last sequence and ends with a semicolon
				if (index === array.length - 1 && sequence.endsWith(";")) {
					return sequence.slice(0, -1);
				}

				return sequence;
			}),
			query[1],
		];
	};
}
