import type { StandardSchema } from "./standard.ts";

/**
 * A schema which defines what data is expected from the database.
 *
 * Optionally an input type can be provided which is useful
 * when you have futures or readonly fields in your database.
 *
 * Input type is used to generate types for create or update queries
 * while the result type is used for queries like select fields
 * or where conditions.
 */
export type SchemaContext<TResult = unknown, TInput = TResult> = {
  result: StandardSchema<unknown, TResult>;
  input?: TInput;
};

export type InferResult<TContext extends SchemaContext> =
  TContext extends SchemaContext<infer TResult, infer _> ? TResult : never;

export type InferInput<TContext extends SchemaContext> =
  TContext extends SchemaContext<infer _, infer TInput> ? TInput : never;

// --- Common schema types ---

export type UnknownSchemaContext = SchemaContext<unknown>;
export type AnySchemaContext = SchemaContext<any>;
