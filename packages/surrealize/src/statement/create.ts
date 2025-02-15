import {
	type BuilderContext,
	createBuilder,
	createStatement,
} from "../query/builder/statements.ts";
import { merge, tag, tagString } from "../query/template.ts";
import { type DurationLike } from "../type/duration.ts";
import { type TargetLike, resolveTarget } from "../type/target.ts";
import { type ContentLike, type SetLike, buildData } from "./shared/data.ts";
import { type ReturnType, buildReturn } from "./shared/return.ts";
import { buildTimeout } from "./shared/timeout.ts";

export const create = <TSchema>() =>
	createStatement((query, ctx) => (targets: TargetLike | TargetLike[]) => {
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

		return createBuilder(query, ctx as BuilderContext<TSchema>, {
			content: content as typeof content<TSchema>,
			set: set as typeof set<TSchema>,
			return: _return as typeof _return<TSchema>,
			timeout: timeout as typeof timeout<TSchema>,
			parallel: parallel as typeof parallel<TSchema>,
		});
	});

export const createOnly = <TSchema>() =>
	createStatement(
		(query, ctx) => (target: TargetLike) =>
			createBuilder(
				query.append(tag`CREATE ONLY ${resolveTarget(target)}`, ""),
				ctx as BuilderContext<TSchema>,
				{
					content: content as typeof content<TSchema>,
					set: set as typeof set<TSchema>,
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
