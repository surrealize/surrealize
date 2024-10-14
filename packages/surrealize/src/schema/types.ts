/**
 * A schema validator function which takes a unknown value and validates it.
 *
 * On success, the function should return the validated value.
 * On failure, the function should throw an error.
 */
export type SchemaFunction<T = unknown> = (value: unknown) => T;

/**
 * A schema like type which can be a {@link SchemaFunction} or a object with a `parse`/`validate` method.
 */
export type SchemaLike<T = unknown> =
	| SchemaFunction<T>
	| Record<"parse", SchemaFunction<T>>
	| Record<"validate", SchemaFunction<T>>;

export type InferSchemaOutput<TSchemaLike extends SchemaLike> =
	TSchemaLike extends SchemaLike<infer TSchemaOutput> ? TSchemaOutput : never;
