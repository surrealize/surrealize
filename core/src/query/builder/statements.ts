import type {
	AnySchemaContext,
	InferResult,
	SchemaContext,
} from "../../schema/context.ts";
import type { StandardSchema } from "../../schema/standard.ts";
import type { Surrealize } from "../../surrealize.ts";
import { Query } from "../query.ts";
import { RawQuery } from "./raw.ts";

export type BuilderContext<TSchema extends SchemaContext = AnySchemaContext> = {
	schema?: TSchema;
	connection?: Surrealize;
};

export type Statement<
	TFn extends (...args: any[]) => any = (...args: any[]) => any,
> = (query: RawQuery, ctx: BuilderContext<any>) => TFn;

export type Builder<
	TStatements extends Record<string, Statement> = Record<string, Statement>,
> = {
	[Key in keyof TStatements]: TStatements[Key] extends Statement<infer TFn>
		? TFn
		: never;
};

export const createStatement = <
	TStatement extends Statement<TFn>,
	TFn extends (...args: any[]) => any,
>(
	statement: TStatement,
): TStatement => statement;

export const createBuilder = <TStatements extends Record<string, Statement>>(
	query: RawQuery,
	ctx: BuilderContext,
	statements: TStatements,
): Builder<TStatements> => {
	const builder = Object.fromEntries(
		Object.entries(statements).map(([key, statement]) => [
			key,
			statement(query, ctx),
		]),
	);

	return builder as Builder<TStatements>;
};

export type WithBuilderContext<TSchema extends SchemaContext> = {
	toQuery: (
		query: RawQuery,
		ctx: BuilderContext<TSchema>,
	) => () => Query<InferResult<TSchema>>;

	"~builder": (
		query: RawQuery,
		ctx: BuilderContext<TSchema>,
	) => () => {
		query: RawQuery;
		ctx: BuilderContext<TSchema>;
	};
};

export const withBuilderContext = <
	TSchema extends SchemaContext,
>(): WithBuilderContext<TSchema> => ({
	toQuery: (query, ctx) => () =>
		query.toQuery<InferResult<TSchema>>({
			schema: ctx.schema?.result as
				| StandardSchema<unknown, InferResult<TSchema>>
				| undefined,
			connection: ctx.connection,
		}),
	"~builder": (query, ctx) => () => ({ query, ctx }),
});
