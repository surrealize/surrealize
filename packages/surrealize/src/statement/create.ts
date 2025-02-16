import type { RawQuery } from "../query/builder/raw.ts";
import {
	type BuilderContext,
	type WithBuilderContext,
	createBuilder,
	createStatement,
	withBuilderContext,
} from "../query/builder/statements.ts";
import { merge, tag, tagString } from "../query/template.ts";
import { type DurationLike } from "../type/duration.ts";
import { type TargetLike, resolveTarget } from "../type/target.ts";
import { type ContentLike, type SetLike, buildData } from "./shared/data.ts";
import { type ReturnType, buildReturn } from "./shared/return.ts";
import { buildTimeout } from "./shared/timeout.ts";

const create = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(targets: TargetLike | TargetLike[]) => {
			targets = Array.isArray(targets) ? targets : [targets];

			query = query.append(
				merge(
					[
						tagString("CREATE"),
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
				set: set as typeof set<TSchema>,
				return: _return as typeof _return<TSchema>,
				timeout: timeout as typeof timeout<TSchema>,
				parallel: parallel as typeof parallel<TSchema>,
				...(withBuilderContext as WithBuilderContext<TSchema>),
			});
		},
);

const createOnly = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(target: TargetLike) =>
			createBuilder(
				query.append(tag`CREATE ONLY ${resolveTarget(target)}`, ""),
				ctx,
				{
					content: content as typeof content<TSchema>,
					set: set as typeof set<TSchema>,
					return: _return as typeof _return<TSchema>,
					timeout: timeout as typeof timeout<TSchema>,
					parallel: parallel as typeof parallel<TSchema>,
					...(withBuilderContext as WithBuilderContext<TSchema>),
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
					return: _return as typeof _return<TSchema>,
					timeout: timeout as typeof timeout<TSchema>,
					parallel: parallel as typeof parallel<TSchema>,
					...(withBuilderContext as WithBuilderContext<TSchema>),
				},
			),
);

const set = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(set: SetLike<TSchema>) =>
			createBuilder(query.append(buildData({ type: "set", set })), ctx, {
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
	create,
	createOnly,
	content,
	set,
	_return as return,
	timeout,
	parallel,
};
