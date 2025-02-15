import {
	type BuilderContext,
	createBuilder,
	createStatement,
} from "../query/builder/statements.ts";
import { merge, tag, tagString } from "../query/template.ts";
import { type DurationLike } from "../type/duration.ts";
import { type TargetLike, resolveTarget } from "../type/target.ts";
import { type ReturnType, buildReturn } from "./shared/return.ts";
import { buildTimeout } from "./shared/timeout.ts";
import { type WhereCondition, buildWhere } from "./shared/where.ts";

export const delete_ = <TSchema>() =>
	createStatement((query, ctx) => (targets: TargetLike | TargetLike[]) => {
		targets = Array.isArray(targets) ? targets : [targets];

		query = query.append(
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

		return createBuilder(query, ctx as BuilderContext<TSchema>, {
			where: where as typeof where<TSchema>,
			return: _return as typeof _return<TSchema>,
			timeout: timeout as typeof timeout<TSchema>,
			parallel: parallel as typeof parallel<TSchema>,
		});
	});

export const deleteOnly = <TSchema>() =>
	createStatement(
		(query, ctx) => (target: TargetLike) =>
			createBuilder(
				query.append(tag`DELETE ONLY ${resolveTarget(target)}`, ""),
				ctx as BuilderContext<TSchema>,
				{
					where: where as typeof where<TSchema>,
					return: _return as typeof _return<TSchema>,
					timeout: timeout as typeof timeout<TSchema>,
					parallel: parallel as typeof parallel<TSchema>,
				},
			),
	);

const where = <TSchema>() =>
	createStatement(
		(query, ctx) =>
			(...conditions: WhereCondition<TSchema>[]) =>
				createBuilder(
					query.append(buildWhere(conditions)),
					ctx as BuilderContext<TSchema>,
					{
						return: _return as typeof _return<TSchema>,
						timeout: timeout as typeof timeout<TSchema>,
						parallel: parallel as typeof parallel<TSchema>,
					},
				),
	);

const _return = <TSchema>() =>
	createStatement(
		(query, ctx) => (type: ReturnType) =>
			createBuilder(
				query.append(buildReturn(type)),
				ctx as BuilderContext<TSchema>,
				{
					timeout: timeout as typeof timeout<TSchema>,
					parallel: parallel as typeof parallel<TSchema>,
				},
			),
	);

const timeout = <TSchema>() =>
	createStatement(
		(query, ctx) => (timeout: DurationLike) =>
			createBuilder(
				query.append(buildTimeout(timeout)),
				ctx as BuilderContext<TSchema>,
				{
					parallel: parallel as typeof parallel<TSchema>,
				},
			),
	);

const parallel = <TSchema>() =>
	createStatement(
		(query, ctx) => () =>
			createBuilder(
				query.append("PARALLEL"),
				ctx as BuilderContext<TSchema>,
				{},
			),
	);
