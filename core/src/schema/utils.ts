import type { SchemaContext } from "./context.ts";
import type { StandardSchema } from "./standard.ts";

export const createSchemaContext = <TResult, TInput = TResult>(
	schema: StandardSchema<unknown, TResult>,
): SchemaContext<TResult, TInput> => ({ result: schema });
