const KEEP_SYMBOL = Symbol("flatten.keep");

/**
 * Indicates that the value should not be flattened and should be used as is.
 *
 * This is especially useful on update operations,
 * where you want to set a whole object instead of updating individual fields.
 *
 * @param value The value which should not be flattened.
 * @returns The wrapped value which indicates the flatting
 *          functionality to keep the value as is.
 */
export const keep = <T extends object>(value: T): T => {
	return Object.assign({ ...value }, { [KEEP_SYMBOL]: true });
};

/**
 * Flatten an object making all nested values available at the top level
 * via dot notation.
 *
 * If you want to keep a nested value as is, use the `keep` function.
 *
 * For example:
 * ```ts
 * const source = {
 *   test: 1,
 *   nested: {
 *     test: 2,
 *     nested: {
 *       test: 3
 *     }
 *   }
 * }
 *
 * flatten(source)
 * // result: {
 * //   test: 1,
 * //   "nested.test": 2,
 * //   "nested.nested.test": 3
 * // }
 * ```
 *
 * @param source The object to flatten.
 * @returns The flattened object.
 */
export const flatten = (
	source: Record<string, unknown>,
): Record<string, unknown> =>
	Object.fromEntries(flattenRecursive(Object.entries(source)));

const flattenRecursive = (
	entries: [string, unknown][],
	prefix = "",
): [string, unknown][] => {
	const flattenEntries: [string, unknown][] = [];

	for (const [key, value] of entries) {
		const flattenKey = prefix + key;

		if (
			// if value is not an object
			typeof value !== "object" ||
			// if value is null
			value === null ||
			// if value is not an array and not an plain object
			(!Array.isArray(value) && value.constructor !== Object)
		) {
			flattenEntries.push([flattenKey, value]);
		} else {
			// if value is an array or a plain object, recursively flatten it
			if (KEEP_SYMBOL in value && value[KEEP_SYMBOL]) {
				// if the value is wrapped with `keep`,
				// then use the value directly wihtout flattening

				// clone the value to avoid mutating the original object
				const newValue = { ...value };

				// remove the symbol
				delete newValue[KEEP_SYMBOL];

				flattenEntries.push([flattenKey, newValue]);
			} else {
				flattenEntries.push(
					...flattenRecursive(Object.entries(value), `${flattenKey}.`),
				);
			}
		}
	}

	return flattenEntries;
};
