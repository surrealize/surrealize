import { type WhereCondition, eqs } from "../statements/common/where";
import { flattenObject } from "./object";

/**
 * Converts a filter object to an array of conditions.
 *
 * A filter object is an object with nested keys and values which are used to filter records.
 *
 * For example:
 * ```ts
 * const filter = {
 *   name: {
 *     first: "John",
 *     last: "Doe"
 *   },
 * }
 *
 * const conditions = convertFilterObjectToConditions(filter);
 * // result: [eqs("name.first", "John"), eqs("name.last", "Doe")]
 * ```
 *
 * @param filter The filter object to convert.
 * @returns The array of conditions.
 */
export const convertFilterObjectToConditions = (
	filter: Record<string, unknown>,
): WhereCondition[] => {
	const conditionEntries = Object.entries(flattenObject(filter));
	const conditions = conditionEntries.map(([field, value]) =>
		// use "equals strict" comparator
		eqs(field, value),
	);

	return conditions;
};
