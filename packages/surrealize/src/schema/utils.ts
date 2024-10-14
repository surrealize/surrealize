import type { SchemaLike } from "./types.ts";

/**
 * Validates a value against a schema and returns the validated value.
 *
 * If the schema validation fails, an error will be thrown.
 *
 * @param schema The schema to validate against.
 * @param value The value to validate.
 * @returns The validated value or an error if the validation failed.
 */
export const parseSchema = <TSchemaOutput>(
	schema: SchemaLike<TSchemaOutput>,
	value: unknown,
): TSchemaOutput => {
	switch (true) {
		case typeof schema === "function":
			return schema(value);
		case typeof schema === "object":
			// like zod
			if ("parse" in schema) return schema.parse(value);
			// like yup
			if ("validate" in schema) return schema.validate(value);
	}
	throw new Error("Invalid schema");
};

export const mergeSchema = <TSchemaOutput>(
	schemas: SchemaLike<TSchemaOutput>[],
): SchemaLike<TSchemaOutput> => {
	const errors: unknown[] = [];

	// create a new schema function which will try each schema in order
	return (value) => {
		for (const schema of schemas) {
			// try each schema
			try {
				return parseSchema(schema, value);
			} catch (error) {
				errors.push(error);
				// if the schema fails, try the next one
			}
		}

		// if all schemas fail, throw an error
		throw new Error(
			"All schemas failed. Expected at least one schema to pass.",
			{ cause: errors },
		);
	};
};
