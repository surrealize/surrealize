import type { RawQuery } from "../query/builder/raw.ts";
import {
	type BuilderContext,
	type WithBuilderContext,
	createBuilder,
	createStatement,
	withBuilderContext,
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

const update = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(targets: TargetLike | TargetLike[]) => {
			targets = Array.isArray(targets) ? targets : [targets];

			const newQuery = query.append(
				merge(
					[
						tagString("UPDATE"),
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
		},
);

const updateOnly = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(target: TargetLike) =>
			createBuilder(
				query.append(tag`UPDATE ONLY ${resolveTarget(target)}`, ""),
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

const content = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(content: ContentLike<TSchema>) =>
			createBuilder(
				query.append(buildData({ type: "content", content })),
				ctx,
				{
					where: where as typeof where<TSchema>,
					return: _return as typeof _return<TSchema>,
					timeout: timeout as typeof timeout<TSchema>,
					parallel: parallel as typeof parallel<TSchema>,
					...(withBuilderContext as WithBuilderContext<TSchema>),
				},
			),
);

const _merge = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(merge: MergeLike<TSchema>) =>
			createBuilder(query.append(buildData({ type: "merge", merge })), ctx, {
				where: where as typeof where<TSchema>,
				return: _return as typeof _return<TSchema>,
				timeout: timeout as typeof timeout<TSchema>,
				parallel: parallel as typeof parallel<TSchema>,
				...(withBuilderContext as WithBuilderContext<TSchema>),
			}),
);

const patch = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(patch: PatchLike<TSchema>) =>
			createBuilder(query.append(buildData({ type: "patch", patch })), ctx, {
				where: where as typeof where<TSchema>,
				return: _return as typeof _return<TSchema>,
				timeout: timeout as typeof timeout<TSchema>,
				parallel: parallel as typeof parallel<TSchema>,
				...(withBuilderContext as WithBuilderContext<TSchema>),
			}),
);

const set = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(set: SetLike<TSchema>) =>
			createBuilder(query.append(buildData({ type: "set", set })), ctx, {
				unset: unset as typeof unset<TSchema>,
				where: where as typeof where<TSchema>,
				return: _return as typeof _return<TSchema>,
				timeout: timeout as typeof timeout<TSchema>,
				parallel: parallel as typeof parallel<TSchema>,
				...(withBuilderContext as WithBuilderContext<TSchema>),
			}),
);

const unset = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(unset: UnsetLike<TSchema>) =>
			createBuilder(query.append(buildData({ type: "unset", unset })), ctx, {
				where: where as typeof where<TSchema>,
				return: _return as typeof _return<TSchema>,
				timeout: timeout as typeof timeout<TSchema>,
				parallel: parallel as typeof parallel<TSchema>,
				...(withBuilderContext as WithBuilderContext<TSchema>),
			}),
);

const where = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(...conditions: WhereCondition<TSchema>[]) =>
			createBuilder(query.append(buildWhere(conditions)), ctx, {
				return: _return as typeof _return<TSchema>,
				timeout: timeout as typeof timeout<TSchema>,
				parallel: parallel as typeof parallel<TSchema>,
				...(withBuilderContext as WithBuilderContext<TSchema>),
			}),
);

const _return = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(type: ReturnType) =>
			createBuilder(query.append(buildReturn(type)), ctx, {
				timeout: timeout as typeof timeout<TSchema>,
				parallel: parallel as typeof parallel<TSchema>,
				...(withBuilderContext as WithBuilderContext<TSchema>),
			}),
);

const timeout = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(timeout: DurationLike) =>
			createBuilder(query.append(buildTimeout(timeout)), ctx, {
				parallel: parallel as typeof parallel<TSchema>,
				...(withBuilderContext as WithBuilderContext<TSchema>),
			}),
);

const parallel = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		() =>
			createBuilder(
				query.append("PARALLEL"),
				ctx,
				withBuilderContext as WithBuilderContext<TSchema>,
			),
);

export {
	update,
	updateOnly,
	content,
	_merge as merge,
	patch,
	set,
	unset,
	where,
	_return as return,
	timeout,
	parallel,
};
