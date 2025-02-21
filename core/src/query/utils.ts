import { RawQuery } from "./builder/raw.ts";
import type { Query } from "./query.ts";
import { type TaggedTemplate, format, merge, tagString } from "./template.ts";
import { type PreparedQuery, type QueryLike } from "./types.ts";

export const resolveQuery = <TOutput>(
	query: QueryLike<TOutput>,
): Query<TOutput> => {
	if ("toQuery" in query) {
		const toQueryValue = query.toQuery();

		if (toQueryValue instanceof RawQuery) {
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
export const prepareQuery = (template: TaggedTemplate): PreparedQuery => {
	const normalizedQuery = stripLastSemicolon(template);
	const formattedQuery = format(normalizedQuery, (_, index) => `$_${index}`);
	const bindings = Object.fromEntries(
		normalizedQuery[1].map((value, index) => [`_${index}`, value] as const),
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
export const prepareTransaction = (queries: Query[]): PreparedQuery => {
	return prepareQuery(
		merge([
			merge(
				// wrap the queries in a transaction
				[
					tagString("BEGIN"),
					...queries.map((query) =>
						merge([tagString("("), query.template, tagString(")")]),
					),
					tagString("COMMIT"),
				],
				";\n",
			),
			tagString(";"),
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
