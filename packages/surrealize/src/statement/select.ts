import {
	type BuilderContext,
	createBuilder,
	createStatement,
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
import { buildTimeout } from "./shared/timeout.ts";
import { type WhereCondition, buildWhere } from "./shared/where.ts";

export const select = <TSchema>() =>
	createStatement((query, ctx) => (fields: Field<TSchema>[] | "*" = "*") => {
		query = query.append("SELECT", "");

		if (fields === "*") {
			query = query.append(" *");
		} else {
			query = query.append(
				tagString(
					`SELECT ${fields.length === 0 ? "*" : enforceFields(fields, "wildcard").join(", ")}`,
				),
			);
		}

		return createBuilder(query, ctx as BuilderContext<TSchema>, {
			from: from as typeof from<TSchema>,
			fromOnly: fromOnly as typeof fromOnly<TSchema>,
		});
	});

export const selectValue = <TSchema>() =>
	createStatement((query, ctx) => (field: Field<TSchema>) => {
		query = query.append(
			tagString(`SELECT VALUE ${enforceField(field, "wildcard")}`),
			"",
		);

		return createBuilder(query, ctx as BuilderContext<TSchema>, {
			from: from as typeof from<TSchema>,
			fromOnly: fromOnly as typeof fromOnly<TSchema>,
		});
	});

const from = <TSchema>() =>
	createStatement((query, ctx) => (targets: TargetLike | TargetLike[]) => {
		targets = Array.isArray(targets) ? targets : [targets];

		query = query.append(
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

		return createBuilder(query, ctx as BuilderContext<TSchema>, {
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
		});
	});

const fromOnly = <TSchema>() =>
	createStatement(
		(query, ctx) => (target: TargetLike) =>
			createBuilder(
				query.append(tag`FROM ONLY ${resolveTarget(target)}`),
				ctx as BuilderContext<TSchema>,
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
				},
			),
	);

const _with = <TSchema>() =>
	createStatement((query, ctx) => (...indexes: string[]) => {
		query =
			indexes.length === 0
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
					);

		return createBuilder(query, ctx as BuilderContext<TSchema>, {
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
		});
	});

const where = <TSchema>() =>
	createStatement(
		(query, ctx) =>
			(...conditions: WhereCondition<TSchema>[]) => {
				return createBuilder(
					query.append(buildWhere(conditions)),
					ctx as BuilderContext<TSchema>,
					{
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
					},
				);
			},
	);

const split = <TSchema>() =>
	createStatement(
		(query, ctx) => (field: Field<TSchema>) =>
			createBuilder(
				query.append(tagString(`SPLIT ${enforceField(field)}`)),
				ctx as BuilderContext<TSchema>,
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
				},
			),
	);

const group = <TSchema>() =>
	createStatement(
		(query, ctx) =>
			(...fields: Field<TSchema>[]) =>
				createBuilder(
					query.append(
						merge(
							[
								tagString("GROUP"),
								merge(enforceFields(fields).map(tagString), ", "),
							],
							" ",
						),
					),
					ctx as BuilderContext<TSchema>,
					{
						order: order as typeof order<TSchema>,
						limit: limit as typeof limit<TSchema>,
						start: start as typeof start<TSchema>,
						fetch: fetch as typeof fetch<TSchema>,
						timeout: timeout as typeof timeout<TSchema>,
						parallel: parallel as typeof parallel<TSchema>,
						tempfiles: tempfiles as typeof tempfiles<TSchema>,
						explain: explain as typeof explain<TSchema>,
					},
				),
	);

const order = <TSchema>() =>
	createStatement(
		(query, ctx) =>
			(
				fields:
					| "rand"
					| Array<
							| Field<TSchema>
							| {
									field: Field<TSchema>;
									mode?: "COLLATE" | "NUMERIC";
									direction?: "ASC" | "DESC";
							  }
					  >,
			) => {
				query = query.append("ORDER");

				if (fields === "rand") {
					query = query.append("rand()");
				} else {
					query = query.append(
						merge(
							fields.map((field) =>
								typeof field === "string"
									? tagString(enforceField(field))
									: tagString(
											`${enforceField(field.field)}${field.mode ? ` ${field.mode}` : ""}${field.direction ? ` ${field.direction}` : ""}`,
										),
							),
							", ",
						),
					);
				}

				return createBuilder(query, ctx as BuilderContext<TSchema>, {
					limit: limit as typeof limit<TSchema>,
					start: start as typeof start<TSchema>,
					fetch: fetch as typeof fetch<TSchema>,
					timeout: timeout as typeof timeout<TSchema>,
					parallel: parallel as typeof parallel<TSchema>,
					tempfiles: tempfiles as typeof tempfiles<TSchema>,
					explain: explain as typeof explain<TSchema>,
				});
			},
	);

const limit = <TSchema>() =>
	createStatement(
		(query, ctx) => (limit: number) =>
			createBuilder(
				query.append(tagString(`LIMIT ${enforceNumber(limit)}`)),
				ctx as BuilderContext<TSchema>,
				{
					start: start as typeof start<TSchema>,
					fetch: fetch as typeof fetch<TSchema>,
					timeout: timeout as typeof timeout<TSchema>,
					parallel: parallel as typeof parallel<TSchema>,
					tempfiles: tempfiles as typeof tempfiles<TSchema>,
					explain: explain as typeof explain<TSchema>,
				},
			),
	);

const start = <TSchema>() =>
	createStatement(
		(query, ctx) => (start: number) =>
			createBuilder(
				query.append(tagString(`START ${enforceNumber(start)}`)),
				ctx as BuilderContext<TSchema>,
				{
					fetch: fetch as typeof fetch<TSchema>,
					timeout: timeout as typeof timeout<TSchema>,
					parallel: parallel as typeof parallel<TSchema>,
					tempfiles: tempfiles as typeof tempfiles<TSchema>,
					explain: explain as typeof explain<TSchema>,
				},
			),
	);

const fetch = <TSchema>() =>
	createStatement(
		(query, ctx) => (fields: Field<TSchema>[]) =>
			createBuilder(
				query.append(
					merge(
						[
							tagString("FETCH"),
							merge(enforceFields(fields).map(tagString), ", "),
						],
						" ",
					),
				),
				ctx as BuilderContext<TSchema>,
				{
					timeout: timeout as typeof timeout<TSchema>,
					parallel: parallel as typeof parallel<TSchema>,
					tempfiles: tempfiles as typeof tempfiles<TSchema>,
					explain: explain as typeof explain<TSchema>,
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
					tempfiles: tempfiles as typeof tempfiles<TSchema>,
					explain: explain as typeof explain<TSchema>,
				},
			),
	);

const parallel = <TSchema>() =>
	createStatement(
		(query, ctx) => () =>
			createBuilder(query.append("PARALLEL"), ctx as BuilderContext<TSchema>, {
				tempfiles: tempfiles as typeof tempfiles<TSchema>,
				explain: explain as typeof explain<TSchema>,
			}),
	);

const tempfiles = <TSchema>() =>
	createStatement(
		(query, ctx) => () =>
			createBuilder(query.append("TEMPFILES"), ctx as BuilderContext<TSchema>, {
				explain: explain as typeof explain<TSchema>,
			}),
	);

const explain = <TSchema>() =>
	createStatement(
		(query, ctx) => (options?: { full?: boolean }) =>
			createBuilder(
				query.append(options?.full ? "EXPLAIN FULL" : "EXPLAIN"),
				ctx as BuilderContext<TSchema>,
				{},
			),
	);
