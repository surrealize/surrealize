import type { StandardSchemaV1 } from "@standard-schema/spec";

export type StandardSchema<
  TInput = unknown,
  TOutput = TInput,
> = StandardSchemaV1<TInput, TOutput>;

export type StandardSchemaResult<TOutput> = StandardSchemaV1.Result<TOutput>;

export type InferStandardInput<TSchema extends StandardSchema> =
  TSchema extends StandardSchema<infer TInput, infer _> ? TInput : never;

export type InferStandardOutput<TSchema extends StandardSchema> =
  TSchema extends StandardSchema<infer _, infer TOutput> ? TOutput : never;

export class ValidationError extends Error {
  constructor(public issues: readonly StandardSchemaV1.Issue[]) {
    super("Validation failed");
  }
}

/**
 * Validates a value against a schema and returns the validated value.
 *
 * If the schema validation fails, an error will be thrown.
 *
 * @param schema The schema to validate against.
 * @param value The value to validate.
 * @returns The validated value or an error if the validation failed.
 */
export const parseSchema = async <TSchema extends StandardSchema>(
  schema: TSchema,
  value: unknown,
): Promise<InferStandardOutput<TSchema>> => {
  const standard = schema["~standard"];

  let result = standard.validate(value);
  if (result instanceof Promise) result = await result;

  if (result.issues) throw new ValidationError(result.issues);

  return result.value as InferStandardOutput<TSchema>;
};

export const mergeSchema = <TInput, TOutput>(
  schemas: StandardSchema<TInput, TOutput>[],
): StandardSchema<TInput, TOutput> => {
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
    "~standard": {
      version: 1,
      vendor: "surrealize",
      validate,
    },
  };
};
