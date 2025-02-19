import type { StandardSchemaV1 } from "@standard-schema/spec";

import type { AnyGraphRecord, AnyRecord } from "../type/record.ts";
import type { RecordId } from "../type/recordid.ts";

/**
 * A schema which implements the Standard Schema V1 specification.
 */
export type Schema<TInput = unknown, TOutput = TInput> = StandardSchemaV1<
	TInput,
	TOutput
>;

export type InferSchemaOutput<TSchema extends Schema> =
	TSchema extends Schema<infer _, infer TOutput> ? TOutput : never;

export type InferSchemaInput<TSchema extends Schema> =
	TSchema extends Schema<infer TInput, infer _> ? TInput : never;

export type UnknownSchema = Schema<unknown>;
export type AnySchema = Schema<any>;

export type RecordSchema<TId extends RecordId> = Schema<AnyRecord<TId>>;

export type GraphRecordSchema<
	TId extends RecordId,
	TIn extends RecordId,
	TOut extends RecordId,
> = Schema<AnyGraphRecord<TId, TIn, TOut>>;

export class ValidationError extends Error {
	constructor(public issues: readonly StandardSchemaV1.Issue[]) {
		super("Validation failed");
	}
}
