import type { StandardSchemaV1 } from "@standard-schema/spec";

import {
	type InferSchemaOutput,
	type Schema,
	ValidationError,
} from "./types.ts";

/**
 * Validates a value against a schema and returns the validated value.
 *
 * If the schema validation fails, an error will be thrown.
 *
 * @param schema The schema to validate against.
 * @param value The value to validate.
 * @returns The validated value or an error if the validation failed.
 */
export const parseSchema = async <TSchema extends Schema>(
	schema: TSchema,
	value: unknown,
): Promise<InferSchemaOutput<TSchema>> => {
	const standard = schema["~standard"];

	let result = standard.validate(value);
	if (result instanceof Promise) result = await result;

	if (result.issues) throw new ValidationError(result.issues);

	return result.value as InferSchemaOutput<TSchema>;
};

export const mergeSchema = <TInput, TOutput>(
	schemas: Schema<TInput, TOutput>[],
): Schema<TInput, TOutput> => {
	const issues: StandardSchemaV1.Issue[] = [];

	const validate = async (
		value: unknown,
	): Promise<StandardSchemaV1.Result<TOutput>> => {
		for (const schema of schemas) {
			try {
				const parsedValue = await parseSchema(schema, value);
				return { value: parsedValue };
			} catch (error) {
				if (error instanceof ValidationError) {
					issues.push(...error.issues);
					// if the schema fails, try the next one
				} else {
					// throw if the error in unrecognized
					throw error;
				}
			}
		}

		return { issues };
	};

	return {
		["~standard"]: {
			version: 1,
			vendor: "surrealize",
			validate,
		},
	};
};
