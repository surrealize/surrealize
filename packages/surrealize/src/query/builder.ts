import { Query, type QueryOptions } from "./query.ts";
import {
	type TaggedTemplate,
	format,
	isEmpty,
	merge,
	tag,
	tagString,
} from "./template.ts";
import type { Transformer } from "./transformer/transformer.ts";
import { type PreparedQuery, type QueryLike, toQuery } from "./types.ts";

export class QueryBuilder {
	#template: TaggedTemplate;

	constructor(initialTemplate?: TaggedTemplate) {
		this.#template = initialTemplate ?? tag``;
	}

	get template(): TaggedTemplate {
		return this.#template;
	}

	/**
	 * Append a {@link TaggedTemplate} to the query.
	 *
	 * @param template The {@link TaggedTemplate} to append.
	 * @param join The join string to use between the queries.
	 * @returns The query builder (`this`).
	 */
	append(template: TaggedTemplate, join = " "): QueryBuilder {
		// skip appending if the template is empty
		if (isEmpty(template)) return this;

		this.#template = merge([this.#template, template], join);
		return this;
	}

	/**
	 * Convert the query to a {@link Query} object which can be executed.
	 *
	 * @param options The options to use for the query.
	 * @returns The query.
	 */
	toQuery<TSchemaOutput>(
		options?: QueryOptions<TSchemaOutput>,
	): Query<TSchemaOutput> {
		return new Query(this.template, options);
	}
}

export const resolveQuery = <TSchemaOutput>(
	query: QueryLike<TSchemaOutput>,
): Query<TSchemaOutput> => {
	if (toQuery in query) {
		const toQueryValue = query[toQuery]();

		if (toQueryValue instanceof QueryBuilder) {
			return toQueryValue.toQuery();
		}

		return toQueryValue;
	}

	return query;
};

/**
 * Convert a tagged template query to a prepared query by replacing variables with bindings.
 *
 * Also encode the variables to their surrealdb.js representation if possible.
 *
 * @param query The tagged template to convert.
 * @returns The compiled query (including the query string and the bindings object).
 */
export const prepareQuery = (
	template: TaggedTemplate,
	transformer?: Transformer,
): PreparedQuery => {
	const normalizedQuery = stripLastSemicolon(template);
	const formattedQuery = format(normalizedQuery, (_, index) => `$_${index}`);
	const bindings = Object.fromEntries(
		normalizedQuery[1].map(
			(value, index) =>
				[`_${index}`, transformer ? transformer.encode(value) : value] as const,
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
export const prepareTransaction = (
	queries: Query[],
	transformer?: any, // TODO
): PreparedQuery => {
	return prepareQuery(
		merge([
			merge(
				// wrap the queries in a transaction
				[
					tag`BEGIN`,
					...queries.map((query) =>
						merge([tagString("("), query.template, tagString(")")]),
					),
					tag`COMMIT`,
				],
				";\n",
			),
			tag`;`,
		]),
		transformer,
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
