import {
	type BuilderContext,
	createBuilder,
	createStatement,
} from "../query/builder/statements.ts";
import { merge, tag, tagString } from "../query/template.ts";
import type { DurationLike } from "../type/duration.ts";
import { type TargetLike, resolveTarget } from "../type/target.ts";
import {
	type ContentLike,
	type MergeLike,
	type PatchLike,
	type SetLike,
	type UnsetLike,
	buildData,
} from "./shared/data.ts";
import { type ReturnType, buildReturn } from "./shared/return.ts";
import { buildTimeout } from "./shared/timeout.ts";
import { type WhereCondition, buildWhere } from "./shared/where.ts";

export const upsert = <TSchema>() =>
	createStatement((query, ctx) => (targets: TargetLike | TargetLike[]) => {
		targets = Array.isArray(targets) ? targets : [targets];
		query = query.append(
			merge(
				[
					tagString("UPSERT"),
					merge(
						targets.map((target) => tag`${resolveTarget(target)}`),
						", ",
					),
				],
				" ",
			),
			"",
		);
		return createBuilder(query, ctx, {
			content: content as typeof content<TSchema>,
			merge: _merge as typeof _merge<TSchema>,
			patch: patch as typeof patch<TSchema>,
			set: set as typeof set<TSchema>,
			unset: unset as typeof unset<TSchema>,
			where: where as typeof where<TSchema>,
			return: _return as typeof _return<TSchema>,
			timeout: timeout as typeof timeout<TSchema>,
			parallel: parallel as typeof parallel<TSchema>,
		});
	});

export const upsertOnly = <TSchema>() =>
	createStatement(
		(query, ctx) => (target: TargetLike) =>
			createBuilder(
				query.append(tag`UPSERT ${resolveTarget(target)}`, ""),
				ctx,
				{
					content: content as typeof content<TSchema>,
					merge: _merge as typeof _merge<TSchema>,
					patch: patch as typeof patch<TSchema>,
					set: set as typeof set<TSchema>,
					unset: unset as typeof unset<TSchema>,
					where: where as typeof where<TSchema>,
					return: _return as typeof _return<TSchema>,
					timeout: timeout as typeof timeout<TSchema>,
					parallel: parallel as typeof parallel<TSchema>,
				},
			),
	);

const content = <TSchema>() =>
	createStatement(
		(query, ctx) => (content: ContentLike<TSchema>) =>
			createBuilder(
				query.append(buildData({ type: "content", content })),
				ctx as BuilderContext<TSchema>,
				{
					where: where as typeof where<TSchema>,
					return: _return as typeof _return<TSchema>,
					timeout: timeout as typeof timeout<TSchema>,
					parallel: parallel as typeof parallel<TSchema>,
				},
			),
	);

const _merge = <TSchema>() =>
	createStatement(
		(query, ctx) => (merge: MergeLike<TSchema>) =>
			createBuilder(
				query.append(buildData({ type: "merge", merge })),
				ctx as BuilderContext<TSchema>,
				{
					where: where as typeof where<TSchema>,
					return: _return as typeof _return<TSchema>,
					timeout: timeout as typeof timeout<TSchema>,
					parallel: parallel as typeof parallel<TSchema>,
				},
			),
	);

const patch = <TSchema>() =>
	createStatement(
		(query, ctx) => (patch: PatchLike<TSchema>) =>
			createBuilder(
				query.append(buildData({ type: "patch", patch })),
				ctx as BuilderContext<TSchema>,
				{
					where: where as typeof where<TSchema>,
					return: _return as typeof _return<TSchema>,
					timeout: timeout as typeof timeout<TSchema>,
					parallel: parallel as typeof parallel<TSchema>,
				},
			),
	);

const set = <TSchema>() =>
	createStatement(
		(query, ctx) => (set: SetLike<TSchema>) =>
			createBuilder(
				query.append(buildData({ type: "set", set })),
				ctx as BuilderContext<TSchema>,
				{
					unset: unset as typeof unset<TSchema>,
					where: where as typeof where<TSchema>,
					return: _return as typeof _return<TSchema>,
					timeout: timeout as typeof timeout<TSchema>,
					parallel: parallel as typeof parallel<TSchema>,
				},
			),
	);

const unset = <TSchema>() =>
	createStatement(
		(query, ctx) => (unset: UnsetLike<TSchema>) =>
			createBuilder(
				query.append(buildData({ type: "unset", unset })),
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
