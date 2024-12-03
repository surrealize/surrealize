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
