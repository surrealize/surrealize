type BuilderContext<TSchema> = { schema: TSchema };

type Statement<TFn extends Function = Function> = (
	query: any,
	ctx: BuilderContext<any>,
	...args: any[]
) => TFn;

type Builder<
	TStatements extends Record<string, Statement> = Record<string, Statement>,
> = {
	[Key in keyof TStatements]: TStatements[Key] extends Statement<infer TFn>
		? TFn
		: never;
};

const createStatement = <T extends Statement>(statement: T): T => statement;

const createBuilder = <TStatements extends Record<string, Statement>>(
	query: any,
	ctx: BuilderContext<unknown>,
	statements: TStatements,
): Builder<TStatements> => {
	return undefined!;
};

type WithContext<TSchema> = {
	"~builder": (
		query: any,
		ctx: BuilderContext<TSchema>,
	) => () => {
		query: any;
		ctx: BuilderContext<TSchema>;
	};
};

const withContext: WithContext<unknown> = {
	"~builder": (query, ctx: BuilderContext<unknown>) => () => ({ query, ctx }),
};

// const applyStatement = <
// 	TArgs extends any[],
// 	TReturn extends WithContext<unknown>,
// >(
// 	statement: (...args: TArgs) => TReturn,
// 	...args: NoInfer<TArgs>
// ): any => statement(...args)["~builder"]()

const select = createStatement(
	<TSchema>(query, ctx: BuilderContext<TSchema>, test: string) =>
		<const TFields extends string[]>(fields: TFields) => {
			return createBuilder(query, ctx, {
				from: from as typeof from<TSchema, TFields>,
			});
		},
);

const from = createStatement(
	<TSchema, Fields extends string[]>(query, ctx) =>
		(target: Fields) => {
			return createBuilder(query, ctx, {
				toQuery: toQuery as typeof toQuery<TSchema>,
				...(withContext as WithContext<TSchema>),
			});
		},
);

const toQuery = createStatement(
	<TSchema>(query, ctx) =>
		() =>
			"query",
);

const x = createBuilder("", { schema: 1 }, { select });

x.select(["field"]).from(["field"]).toQuery();
