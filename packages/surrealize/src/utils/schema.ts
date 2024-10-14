export type AnySchemaOutput = unknown;

/**
 * A schema validator function which takes a unknown value and validates it.
 *
 * On success, the function should return the validated value.
 * On failure, the function should throw an error.
 */
export type SchemaFunction<TSchemaOutput = AnySchemaOutput> = (
	value: unknown,
) => TSchemaOutput;

/**
 * A schema like type which can be a {@link SchemaFunction} or a object with a `parse`/`validate` method.
 */
export type SchemaLike<TSchemaOutput = AnySchemaOutput> =
	| SchemaFunction<TSchemaOutput>
	| { parse: SchemaFunction<TSchemaOutput> }
	| { validate: SchemaFunction<TSchemaOutput> };

export type InferSchemaOutput<TSchemaLike extends SchemaLike> =
	TSchemaLike extends SchemaLike<infer TSchemaOutput> ? TSchemaOutput : never;

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

export const mergeSchemas = <TSchemaOutput>(
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
 * Converts a schema to also allow null values.
 *
 * @param schema The schema to convert.
 * @returns The given schema which also accepts null values.
 */
export const convertSchemaUndefinable = <const TSchemaOutput>(
	schema: SchemaLike<TSchemaOutput>,
): SchemaLike<TSchemaOutput | undefined> => {
	return mergeSchemas([undefinedSchema, schema]);
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

/**
 * Takes two schema outputs and returns the first one which is not unknown.
 */
export type TakeSchemaOutput<TSchemaOutput1, TSchemaOutput2> =
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
export type TakeSchema<
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
export const takeSchema = <
	const TSchemaLike1 extends SchemaLike | undefined = undefined,
	const TSchemaLike2 extends SchemaLike | undefined = undefined,
>(
	schema1?: TSchemaLike1,
	schema2?: TSchemaLike2,
): TakeSchema<TSchemaLike1, TSchemaLike2> => {
	return (schema1 ?? schema2) as TakeSchema<TSchemaLike1, TSchemaLike2>;
};
