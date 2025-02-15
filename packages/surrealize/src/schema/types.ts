import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * A schema which implements the Standard Schema V1 specification.
 */
export type Schema<TInput = unknown, TOutput = TInput> = StandardSchemaV1<
	TInput,
	TOutput
>;

// TODO good schema handling?
export type SchemaWithOutput<TOutput = unknown> = Schema<unknown, TOutput>;

export type InferSchemaOutput<TSchema extends Schema> =
	TSchema extends Schema<infer _, infer TOutput> ? TOutput : never;

export class ValidationError extends Error {
	constructor(public issues: readonly StandardSchemaV1.Issue[]) {
		super("Validation failed");
	}
}
