import {
	type InferStandardInput,
	type InferStandardOutput,
	type StandardSchema,
	type StandardSchemaResult,
	mergeSchema,
	parseSchema,
} from "./standard.ts";

/**
 * A schema which accepts undefined values.
 *
 * @param value The value to validate.
 * @returns undefined if the value is undefined, otherwise throws an error.
 */
export const undefinedSchema: StandardSchema<undefined> = {
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
export const alwaysTo = <T>(value: T): StandardSchema<T> => ({
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
export const asArraySchema = <TSchema extends StandardSchema>(
	schema?: TSchema,
):
	| StandardSchema<
			InferStandardInput<TSchema>[],
			InferStandardOutput<TSchema>[]
	  >
	| undefined => {
	if (!schema) return undefined;

	const validate = async (
		value: unknown,
	): Promise<StandardSchemaResult<InferStandardOutput<TSchema>[]>> => {
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

export const withUndefinedSchema = <TSchema extends StandardSchema>(
	schema?: TSchema,
):
	| StandardSchema<
			InferStandardInput<TSchema> | undefined,
			InferStandardOutput<TSchema> | undefined
	  >
	| undefined => {
	if (!schema) return undefined;
	return mergeSchema([schema, undefinedSchema]) as StandardSchema<
		InferStandardInput<TSchema> | undefined,
		InferStandardOutput<TSchema> | undefined
	>;
};
