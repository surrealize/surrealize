import type { Schema } from "./types.ts";

/**
 * Takes two schema outputs and returns the first one which is not unknown.
 */
export type FallbackSchemaOutput<TSchemaOutput1, TSchemaOutput2> =
	unknown extends TSchemaOutput1
		? unknown extends TSchemaOutput2
			? unknown
			: TSchemaOutput2
		: TSchemaOutput1;

/**
 * Takes two schema like inputs and returns the first one which is not undefined.
 *
 * In case both inputs are undefined, it returns undefined.
 */
export type FallbackSchema<
	TSchema1 extends Schema | undefined,
	TSchema2 extends Schema | undefined,
> = TSchema1 extends undefined
	? TSchema2 extends undefined
		? undefined
		: TSchema2
	: TSchema1;

/**
 * Takes two schema like inputs and returns the first one which is not undefined.
 *
 * @param schema1 The first schema.
 * @param schema2 The second schema.
 * @returns The first schema which is not undefined or undefined if both schemas are undefined.
 */
export const fallbackSchema = <
	const TSchema1 extends Schema | undefined = undefined,
	const TSchema2 extends Schema | undefined = undefined,
>(
	schema1?: TSchema1,
	schema2?: TSchema2,
): FallbackSchema<TSchema1, TSchema2> => {
	return (schema1 ?? schema2) as FallbackSchema<TSchema1, TSchema2>;
};
