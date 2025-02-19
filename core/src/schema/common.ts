import type { StandardSchemaV1 } from "@standard-schema/spec";

import type { Schema } from "./types.ts";
import { mergeSchema, parseSchema } from "./utils.ts";

/**
 * A schema which accepts undefined values.
 *
 * @param value The value to validate.
 * @returns undefined if the value is undefined, otherwise throws an error.
 */
export const undefinedSchema: Schema<undefined> = {
	"~standard": {
		version: 1,
		vendor: "surrealize",
		validate: (value) => {
			if (value === undefined) return { value };
			return { issues: [{ message: "Expected undefined" }] };
		},
	},
};

/**
 * Get a schema which always returns the specified value.
 *
 * @param value The value to return.
 * @returns A schema which always returns the specified value.
 */
export const alwaysTo = <T>(value: T): Schema<T> => ({
	"~standard": {
		version: 1,
		vendor: "surrealize",
		validate: () => ({ value }),
	},
});

/**
 * Converts a schema to an array schema.
 *
 * For example: A `User` schema will be converted to an `User[]` schema.
 *
 * @param schema The schema to convert.
 * @returns The schema as an array.
 */
export const convertSchemaArray = <const TSchemaOutput>(
	schema: Schema<TSchemaOutput>,
): Schema<TSchemaOutput[]> => {
	const validate = async (
		value: unknown,
	): Promise<StandardSchemaV1.Result<TSchemaOutput[]>> => {
		if (!Array.isArray(value))
			return { issues: [{ message: "Expected array" }] };
		const results = await Promise.all(
			value.map((item) => parseSchema(schema, item)),
		);
		return { value: results };
	};

	return {
		"~standard": {
			version: 1,
			vendor: "surrealize",
			validate,
		},
	};
};

export const convertSchemaUndefinable = <TSchema>(
	schema: Schema<TSchema>,
): Schema<TSchema | undefined> => {
	return mergeSchema([schema, undefinedSchema]);
};
