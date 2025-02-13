import type { Query } from "../query.ts";
import { type Queryable, toQuery } from "../types.ts";
import type { RawQuery } from "./raw.ts";

export type StatementFn = (...args: any[]) => Builder | Builder<{}>;

export type BuilderOptions = {
	toQuery: () => Query;
	["~raw"]: RawQuery;
} & Queryable;

export type Statement<TFn extends StatementFn = StatementFn> = (
	raw: RawQuery,
) => TFn;

export type LazyStatement<TFn extends StatementFn = StatementFn> =
	() => Statement<TFn>;

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
	statements: TStatements,
): Builder<TStatements> => {
	const builder = Object.fromEntries(
		Object.entries(statements ?? {}).map<[string, StatementFn]>(
			([key, statement]) => [key, statement()(raw)],
		),
	);

	const toQueryFn = () => raw.toQuery();

	return {
		...builder,

		toQuery: toQueryFn,
		"~raw": raw,
		[toQuery]: toQueryFn,
	} as Builder<TStatements>;
};
