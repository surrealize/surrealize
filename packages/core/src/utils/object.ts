export type Appended<
	Source extends Record<string, unknown>,
	Append extends Record<string, unknown>,
> = Append & Omit<Source, keyof Append>;

export const appendObject = <
	const Source extends Record<string, unknown>,
	const Append extends Record<string, unknown>,
>(
	source: Source,
	append: Append,
): Appended<Source, Append> => ({ ...source, ...append });

export type AppendedArray<
	Source extends unknown[],
	Append extends unknown[],
> = [
	...(Source extends never[] ? [] : Source),
	...(Append extends never[] ? [] : Append),
];

export const appendArray = <
	const Source extends unknown[],
	const Append extends unknown[],
>(
	source: Source,
	append: Append,
): AppendedArray<Source, Append> =>
	[...source, ...append] as AppendedArray<Source, Append>;

/**
 * A deep partial type which allows for deeply partially defined objects and arrays.
 */
export type DeepPartial<T> = T extends Record<string, unknown> | Array<unknown>
	? {
			[P in keyof T]?: DeepPartial<T[P]>;
		}
	: T;

export const flattenObject = (
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
			flattenEntries.push(
				...flattenRecursive(Object.entries(value), `${flattenKey}.`),
			);
		}
	}

	return flattenEntries;
};

/**
 *  A type which only makes a subset of keys partial.
 */
export type PartialOnly<T, K extends keyof T> = Omit<T, K> &
	Partial<Pick<T, K>>;

/**
 * A type which only makes a subset of keys required.
 */
export type RequiredOnly<T, K extends keyof T> = Omit<T, K> &
	Required<Pick<T, K>>;
