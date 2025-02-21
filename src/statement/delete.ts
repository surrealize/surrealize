import type { RawQuery } from "../query/builder/raw.ts";
import {
	type BuilderContext,
	createBuilder,
	createStatement,
	withBuilderContext,
} from "../query/builder/statements.ts";
import { merge, tag, tagString } from "../query/template.ts";
import type { SchemaContext } from "../schema/context.ts";
import { type DurationLike } from "../type/duration.ts";
import { type TargetLike, resolveTarget } from "../type/target.ts";
import { type ReturnType, buildReturn } from "./shared/return.ts";
import { buildTimeout } from "./shared/timeout.ts";
import { type WhereCondition, buildWhere } from "./shared/where.ts";

const _delete = createStatement(
	<TSchema extends SchemaContext>(
		query: RawQuery,
		ctx: BuilderContext<TSchema>,
	) =>
		(targets: TargetLike | TargetLike[]) => {
			targets = Array.isArray(targets) ? targets : [targets];

			const newQuery = query.append(
				merge(
					[
						tagString("DELETE"),
						merge(
							targets.map((target) => tag`${resolveTarget(target)}`),
							", ",
						),
					],
					" ",
				),
				"",
			);

			return createBuilder(newQuery, ctx, {
				where: where as typeof where<TSchema>,
				return: _return as typeof _return<TSchema>,
				timeout: timeout as typeof timeout<TSchema>,
				parallel: parallel as typeof parallel<TSchema>,
				...withBuilderContext<TSchema>(),
			});
		},
);

const deleteOnly = createStatement(
	<TSchema extends SchemaContext>(
		query: RawQuery,
		ctx: BuilderContext<TSchema>,
	) =>
		(target: TargetLike) => {
			return createBuilder(
				query.append(tag`DELETE ONLY ${resolveTarget(target)}`, ""),
				ctx as BuilderContext<TSchema>,
				{
					where: where as typeof where<TSchema>,
					return: _return as typeof _return<TSchema>,
					timeout: timeout as typeof timeout<TSchema>,
					parallel: parallel as typeof parallel<TSchema>,
					...withBuilderContext<TSchema>(),
				},
			);
		},
);

const where = createStatement(
	<TSchema extends SchemaContext>(
		query: RawQuery,
		ctx: BuilderContext<TSchema>,
	) =>
		(conditions?: WhereCondition<TSchema>[]) =>
			createBuilder(
				query.append(buildWhere(conditions)),
				ctx as BuilderContext<TSchema>,
				{
					return: _return as typeof _return<TSchema>,
					timeout: timeout as typeof timeout<TSchema>,
					parallel: parallel as typeof parallel<TSchema>,
					...withBuilderContext<TSchema>(),
				},
			),
);

const _return = createStatement(
	<TSchema extends SchemaContext>(
		query: RawQuery,
		ctx: BuilderContext<TSchema>,
	) =>
		(type?: ReturnType) =>
			createBuilder(
				query.append(buildReturn(type)),
				ctx as BuilderContext<TSchema>,
				{
					timeout: timeout as typeof timeout<TSchema>,
					parallel: parallel as typeof parallel<TSchema>,
					...withBuilderContext<TSchema>(),
				},
			),
);

const timeout = createStatement(
	<TSchema extends SchemaContext>(
		query: RawQuery,
		ctx: BuilderContext<TSchema>,
	) =>
		(timeout?: DurationLike) =>
			createBuilder(
				query.append(buildTimeout(timeout)),
				ctx as BuilderContext<TSchema>,
				{
					parallel: parallel as typeof parallel<TSchema>,
					...withBuilderContext<TSchema>(),
				},
			),
);

const parallel = createStatement(
	<TSchema extends SchemaContext>(
		query: RawQuery,
		ctx: BuilderContext<TSchema>,
	) =>
		(append: boolean = true) =>
			createBuilder(
				append ? query.append("PARALLEL") : query,
				ctx as BuilderContext<TSchema>,
				withBuilderContext<TSchema>(),
			),
);

export {
	_delete as delete,
	deleteOnly,
	where,
	_return as return,
	timeout,
	parallel,
};
