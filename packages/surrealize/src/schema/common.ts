import type { SchemaFunction, SchemaLike } from "./types.ts";
import { mergeSchema, parseSchema } from "./utils.ts";

/**
 * A schema which accepts undefined values.
 *
 * @param value The value to validate.
 * @returns undefined if the value is undefined, otherwise throws an error.
 */
export const undefinedSchema: SchemaFunction<undefined> = (value: unknown) => {
	if (value !== undefined)
		throw new Error(`Expected undefined, received: ${value}`);
	return undefined;
};

/**
 * Converts a schema to an array schema.
 *
 * For example: A `User` schema will be converted to an `User[]` schema.
 *
 * @param schema The schema to convert.
 * @returns The schema as an array.
 */
export const convertSchemaArray = <const TSchemaOutput>(
	schema: SchemaLike<TSchemaOutput>,
): SchemaLike<TSchemaOutput[]> => {
	return (value: unknown) => {
		if (!Array.isArray(value))
			throw new Error(`Expected array, received: ${typeof value}`);

		return value.map((item) => parseSchema(schema, item));
	};
};

export const convertSchemaUndefinable = <const TSchemaOutput>(
	schema: SchemaLike<TSchemaOutput>,
): SchemaLike<TSchemaOutput | undefined> => {
	return mergeSchema([schema, undefinedSchema]);
};
