import type { RawQuery } from "../query/builder/raw.ts";
import {
	type BuilderContext,
	type WithBuilderContext,
	createBuilder,
	createStatement,
	withBuilderContext,
} from "../query/builder/statements.ts";
import { merge, tag, tagString } from "../query/template.ts";
import {
	type Field,
	enforceField,
	enforceFields,
} from "../query/validation/field.ts";
import { enforceName, enforceNumber } from "../query/validation/primitives.ts";
import { type DurationLike } from "../type/duration.ts";
import { type TargetLike, resolveTarget } from "../type/target.ts";
import { type OrderFields, buildOrder } from "./shared/order.ts";
import { buildTimeout } from "./shared/timeout.ts";
import { type WhereCondition, buildWhere } from "./shared/where.ts";

const select = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(fields: Field<TSchema>[] | "*" = "*") => {
			let newQuery = query.append("SELECT", "");

			if (fields === "*") {
				newQuery = newQuery.append("*");
			} else {
				newQuery = newQuery.append(
					tagString(enforceFields(fields, "wildcard").join(", ")),
				);
			}

			return createBuilder(newQuery, ctx, {
				from: from as typeof from<TSchema>,
				fromOnly: fromOnly as typeof fromOnly<TSchema>,
				...(withBuilderContext as WithBuilderContext<TSchema>),
			});
		},
);

const selectValue = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(field: Field<TSchema>) => {
			const newQuery = query.append(
				tagString(`SELECT VALUE ${enforceField(field, "wildcard")}`),
				"",
			);

			return createBuilder(newQuery, ctx, {
				from: from as typeof from<TSchema>,
				fromOnly: fromOnly as typeof fromOnly<TSchema>,
				...(withBuilderContext as WithBuilderContext<TSchema>),
			});
		},
);

const from = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(targets: TargetLike | TargetLike[]) => {
			targets = Array.isArray(targets) ? targets : [targets];

			const newQuery = query.append(
				merge(
					[
						tagString("FROM"),
						merge(
							targets.map((target) => tag`${resolveTarget(target)}`),
							", ",
						),
					],
					" ",
				),
			);

			return createBuilder(newQuery, ctx, {
				with: _with as typeof _with<TSchema>,
				where: where as typeof where<TSchema>,
				split: split as typeof split<TSchema>,
				group: group as typeof group<TSchema>,
				order: order as typeof order<TSchema>,
				limit: limit as typeof limit<TSchema>,
				start: start as typeof start<TSchema>,
				fetch: fetch as typeof fetch<TSchema>,
				timeout: timeout as typeof timeout<TSchema>,
				parallel: parallel as typeof parallel<TSchema>,
				tempfiles: tempfiles as typeof tempfiles<TSchema>,
				explain: explain as typeof explain<TSchema>,
				...(withBuilderContext as WithBuilderContext<TSchema>),
			});
		},
);

const fromOnly = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(target: TargetLike) => {
			return createBuilder(
				query.append(tag`FROM ONLY ${resolveTarget(target)}`),
				ctx,
				{
					with: _with as typeof _with<TSchema>,
					where: where as typeof where<TSchema>,
					split: split as typeof split<TSchema>,
					group: group as typeof group<TSchema>,
					order: order as typeof order<TSchema>,
					limit: limit as typeof limit<TSchema>,
					start: start as typeof start<TSchema>,
					fetch: fetch as typeof fetch<TSchema>,
					timeout: timeout as typeof timeout<TSchema>,
					parallel: parallel as typeof parallel<TSchema>,
					tempfiles: tempfiles as typeof tempfiles<TSchema>,
					explain: explain as typeof explain<TSchema>,
					...(withBuilderContext as WithBuilderContext<TSchema>),
				},
			);
		},
);

const _with = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(indexes?: string[]) => {
			const newQuery = indexes
				? indexes.length === 0
					? query.append(tagString("WITH NOINDEX"))
					: query.append(
							merge(
								[
									tagString("WITH INDEX"),
									merge(
										indexes.map((index) => tagString(enforceName(index))),
										", ",
									),
								],
								" ",
							),
						)
				: query;

			return createBuilder(newQuery, ctx, {
				where: where as typeof where<TSchema>,
				split: split as typeof split<TSchema>,
				group: group as typeof group<TSchema>,
				order: order as typeof order<TSchema>,
				limit: limit as typeof limit<TSchema>,
				start: start as typeof start<TSchema>,
				fetch: fetch as typeof fetch<TSchema>,
				timeout: timeout as typeof timeout<TSchema>,
				parallel: parallel as typeof parallel<TSchema>,
				tempfiles: tempfiles as typeof tempfiles<TSchema>,
				explain: explain as typeof explain<TSchema>,
				...(withBuilderContext as WithBuilderContext<TSchema>),
			});
		},
);

const where = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(conditions?: WhereCondition<TSchema>[]) => {
			return createBuilder(query.append(buildWhere(conditions)), ctx, {
				split: split as typeof split<TSchema>,
				group: group as typeof group<TSchema>,
				order: order as typeof order<TSchema>,
				limit: limit as typeof limit<TSchema>,
				start: start as typeof start<TSchema>,
				fetch: fetch as typeof fetch<TSchema>,
				timeout: timeout as typeof timeout<TSchema>,
				parallel: parallel as typeof parallel<TSchema>,
				tempfiles: tempfiles as typeof tempfiles<TSchema>,
				explain: explain as typeof explain<TSchema>,
				...(withBuilderContext as WithBuilderContext<TSchema>),
			});
		},
);

const split = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(field?: Field<TSchema>) => {
			return createBuilder(
				field ? query.append(tagString(`SPLIT ${enforceField(field)}`)) : query,
				ctx,
				{
					group: group as typeof group<TSchema>,
					order: order as typeof order<TSchema>,
					limit: limit as typeof limit<TSchema>,
					start: start as typeof start<TSchema>,
					fetch: fetch as typeof fetch<TSchema>,
					timeout: timeout as typeof timeout<TSchema>,
					parallel: parallel as typeof parallel<TSchema>,
					tempfiles: tempfiles as typeof tempfiles<TSchema>,
					explain: explain as typeof explain<TSchema>,
					...(withBuilderContext as WithBuilderContext<TSchema>),
				},
			);
		},
);

const group = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(fields?: Field<TSchema>[]) => {
			const newQuery =
				!fields || fields.length === 0
					? query
					: query.append(
							merge(
								[
									tagString("GROUP"),
									merge(enforceFields(fields).map(tagString), ", "),
								],
								" ",
							),
						);

			return createBuilder(newQuery, ctx, {
				order: order as typeof order<TSchema>,
				limit: limit as typeof limit<TSchema>,
				start: start as typeof start<TSchema>,
				fetch: fetch as typeof fetch<TSchema>,
				timeout: timeout as typeof timeout<TSchema>,
				parallel: parallel as typeof parallel<TSchema>,
				tempfiles: tempfiles as typeof tempfiles<TSchema>,
				explain: explain as typeof explain<TSchema>,
				...(withBuilderContext as WithBuilderContext<TSchema>),
			});
		},
);

const order = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(fields?: OrderFields<TSchema>) => {
			return createBuilder(query.append(buildOrder(fields)), ctx, {
				limit: limit as typeof limit<TSchema>,
				start: start as typeof start<TSchema>,
				fetch: fetch as typeof fetch<TSchema>,
				timeout: timeout as typeof timeout<TSchema>,
				parallel: parallel as typeof parallel<TSchema>,
				tempfiles: tempfiles as typeof tempfiles<TSchema>,
				explain: explain as typeof explain<TSchema>,
				...(withBuilderContext as WithBuilderContext<TSchema>),
			});
		},
);

const limit = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(limit?: number) => {
			return createBuilder(
				limit
					? query.append(tagString(`LIMIT ${enforceNumber(limit)}`))
					: query,
				ctx,
				{
					start: start as typeof start<TSchema>,
					fetch: fetch as typeof fetch<TSchema>,
					timeout: timeout as typeof timeout<TSchema>,
					parallel: parallel as typeof parallel<TSchema>,
					tempfiles: tempfiles as typeof tempfiles<TSchema>,
					explain: explain as typeof explain<TSchema>,
					...(withBuilderContext as WithBuilderContext<TSchema>),
				},
			);
		},
);

const start = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(start?: number) => {
			return createBuilder(
				start
					? query.append(tagString(`START ${enforceNumber(start)}`))
					: query,
				ctx,
				{
					fetch: fetch as typeof fetch<TSchema>,
					timeout: timeout as typeof timeout<TSchema>,
					parallel: parallel as typeof parallel<TSchema>,
					tempfiles: tempfiles as typeof tempfiles<TSchema>,
					explain: explain as typeof explain<TSchema>,
					...(withBuilderContext as WithBuilderContext<TSchema>),
				},
			);
		},
);

const fetch = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(fields?: Field<TSchema>[]) => {
			const newQuery =
				!fields || fields.length === 0
					? // do nothing if no fields are provided
						query
					: // otherwise append the fields
						query.append(
							merge(
								[
									tagString("FETCH"),
									merge(enforceFields(fields).map(tagString), ", "),
								],
								" ",
							),
						);

			return createBuilder(newQuery, ctx, {
				timeout: timeout as typeof timeout<TSchema>,
				parallel: parallel as typeof parallel<TSchema>,
				tempfiles: tempfiles as typeof tempfiles<TSchema>,
				explain: explain as typeof explain<TSchema>,
				...(withBuilderContext as WithBuilderContext<TSchema>),
			});
		},
);

const timeout = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(timeout?: DurationLike) => {
			return createBuilder(query.append(buildTimeout(timeout)), ctx, {
				parallel: parallel as typeof parallel<TSchema>,
				tempfiles: tempfiles as typeof tempfiles<TSchema>,
				explain: explain as typeof explain<TSchema>,
				...(withBuilderContext as WithBuilderContext<TSchema>),
			});
		},
);

const parallel = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(append = true) => {
			return createBuilder(append ? query.append("PARALLEL") : query, ctx, {
				tempfiles: tempfiles as typeof tempfiles<TSchema>,
				explain: explain as typeof explain<TSchema>,
				...(withBuilderContext as WithBuilderContext<TSchema>),
			});
		},
);

const tempfiles = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(append = true) => {
			return createBuilder(append ? query.append("TEMPFILES") : query, ctx, {
				explain: explain as typeof explain<TSchema>,
				...(withBuilderContext as WithBuilderContext<TSchema>),
			});
		},
);

const explain = createStatement(
	<TSchema>(query: RawQuery, ctx: BuilderContext<TSchema>) =>
		(options?: { full?: boolean } | false) => {
			return createBuilder(
				options !== false
					? query.append(options?.full ? "EXPLAIN FULL" : "EXPLAIN")
					: query,
				ctx,
				withBuilderContext as WithBuilderContext<TSchema>,
			);
		},
);

export {
	select,
	selectValue,
	from,
	fromOnly,
	_with as with,
	where,
	split,
	group,
	order,
	limit,
	start,
	fetch,
	timeout,
	parallel,
	tempfiles,
	explain,
};
