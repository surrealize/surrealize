import type { SchemaLike } from "./types.ts";

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
	TSchemaLike1 extends SchemaLike | undefined,
	TSchemaLike2 extends SchemaLike | undefined,
> = TSchemaLike1 extends undefined
	? TSchemaLike2 extends undefined
		? undefined
		: TSchemaLike2
	: TSchemaLike1;

/**
 * Takes two schema like inputs and returns the first one which is not undefined.
 *
 * @param schema1 The first schema.
 * @param schema2 The second schema.
 * @returns The first schema which is not undefined or undefined if both schemas are undefined.
 */
export const fallbackSchema = <
	const TSchemaLike1 extends SchemaLike | undefined = undefined,
	const TSchemaLike2 extends SchemaLike | undefined = undefined,
>(
	schema1?: TSchemaLike1,
	schema2?: TSchemaLike2,
): FallbackSchema<TSchemaLike1, TSchemaLike2> => {
	return (schema1 ?? schema2) as FallbackSchema<TSchemaLike1, TSchemaLike2>;
};
