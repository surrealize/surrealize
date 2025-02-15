import type { Schema } from "../../schema/types.ts";
import type { Surrealize } from "../../surrealize.ts";
import type { Query } from "../query.ts";
import type { RawQuery } from "./raw.ts";

export type StatementFn = (
	...args: any[]
) => Builder<any, any> | Builder<{}, any>;

export type BuilderContext<TSchema = unknown> = {
	schema?: Schema<TSchema>;
	connection?: Surrealize;
};

export type BuilderOptions<TSchema = unknown> = {
	toQuery: () => Query<TSchema>;

	["~ctx"]: {
		raw: RawQuery;
		toQuery: () => Query<TSchema>;
	} & BuilderContext<TSchema>;
};

export type Statement<TFn extends StatementFn = StatementFn> = (
	raw: RawQuery,
	ctx: BuilderContext<unknown>,
) => TFn;

export type LazyStatement<TFn extends StatementFn = StatementFn> =
	() => Statement<TFn>;

export type Builder<
	TStatements extends Record<string, LazyStatement>,
	TSchema,
> = {
	[Key in keyof TStatements]: TStatements[Key] extends () => Statement<
		infer TFn
	>
		? TFn
		: never;
} & BuilderOptions<TSchema>;

export const createStatement = <const TFn extends StatementFn>(
	statement: Statement<TFn>,
): Statement<TFn> => statement;

export const createBuilder = <
	const TStatements extends Record<string, LazyStatement>,
	TSchema,
>(
	raw: RawQuery,
	ctx: BuilderContext<TSchema>,
	statements: TStatements,
): Builder<TStatements, TSchema> => {
	const builder = Object.fromEntries(
		Object.entries(statements ?? {}).map<[string, StatementFn]>(
			([key, statement]) => [key, statement()(raw, ctx)],
		),
	);

	const toQueryFn = () =>
		raw.toQuery({ schema: ctx.schema, connection: ctx.connection });

	return {
		...builder,

		toQuery: toQueryFn,

		"~ctx": {
			toQuery: toQueryFn,
			raw,
			...ctx,
		},
	} as Builder<TStatements, TSchema>;
};
