import type { Schema } from "../../schema/types.ts";
import type { Surrealize } from "../../surrealize.ts";
import type { Query } from "../query.ts";
import type { RawQuery } from "./raw.ts";

export type StatementFn = (...args: any[]) => Builder | Builder<{}>;

export type BuilderContext = {
	schema?: Schema;
	connection?: Surrealize;
};

export type BuilderOptions = {
	toQuery: () => Query;

	["~ctx"]: {
		raw: RawQuery;
		toQuery: () => Query;
	} & BuilderContext;
};

export type Statement<TFn extends StatementFn = StatementFn> = (
	raw: RawQuery,
	ctx: BuilderContext,
) => TFn;

export type LazyStatement<TFn extends StatementFn = StatementFn> =
	() => Statement<TFn>;

// TODO pass schema types to query
export type Builder<
	TStatements extends Record<string, LazyStatement> = Record<
		string,
		LazyStatement
	>,
> = {
	[Key in keyof TStatements]: TStatements[Key] extends () => Statement<
		infer TFn
	>
		? TFn
		: never;
} & BuilderOptions;

export const createStatement = <const TFn extends StatementFn>(
	statement: Statement<TFn>,
): Statement<TFn> => statement;

export const createBuilder = <
	const TStatements extends Record<string, LazyStatement>,
>(
	raw: RawQuery,
	ctx: BuilderContext,
	statements: TStatements,
): Builder<TStatements> => {
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
	} as Builder<TStatements>;
};
