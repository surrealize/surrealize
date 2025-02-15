import {
	type Builder,
	createBuilder,
	createStatement,
} from "../query/builder/statements.ts";
import { merge, tag, tagString } from "../query/template.ts";
import {
	type InferFields,
	enforceField,
	enforceFields,
} from "../query/validation/field.ts";
import { type TargetLike, resolveTarget } from "../type/target.ts";
import { type WhereCondition, buildWhere } from "./shared/where.ts";

export const select = <TSchema>() =>
	createStatement((raw, ctx) => {
		return (
			...fields: InferFields<TSchema>[]
		): Builder<{
			from: typeof from<TSchema>;
			fromOnly: typeof fromOnly<TSchema>;
		}> => {
			const appended = raw.append(
				tagString(
					`SELECT ${fields.length === 0 ? "*" : enforceFields(fields, "wildcard").join(", ")}`,
				),
			);

			return createBuilder(appended, ctx, { from, fromOnly });
		};
	});

export const selectValue = <TSchema>() =>
	createStatement((raw, ctx) => {
		return (
			field: InferFields<TSchema>,
		): Builder<{
			from: typeof from<TSchema>;
			fromOnly: typeof fromOnly<TSchema>;
		}> => {
			const appended = raw.append(
				tagString(`SELECT VALUE ${enforceField(field, "wildcard")}`),
			);

			return createBuilder(appended, ctx, { from, fromOnly });
		};
	});

const from = <TSchema>() =>
	createStatement(
		(raw, ctx) =>
			(
				...targets: TargetLike[]
			): Builder<{
				parallel: typeof parallel<TSchema>;
			}> =>
				createBuilder(
					raw.append(
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
					),
					ctx,
					{ parallel },
				),
	);

const fromOnly = <TSchema>() =>
	createStatement(
		(raw, ctx) =>
			(
				target: TargetLike,
			): Builder<{
				where: typeof where<TSchema>;
				parallel: typeof parallel<TSchema>;
			}> =>
				createBuilder(
					raw.append(tag`FROM ONLY ${resolveTarget(target)}`),
					ctx,
					{
						where,
						parallel,
					},
				),
	);

const where = <TSchema>() =>
	createStatement(
		(raw, ctx) =>
			(
				...conditions: WhereCondition<TSchema>[]
			): Builder<{
				parallel: typeof parallel<TSchema>;
			}> => {
				return createBuilder(raw.append(buildWhere(conditions)), ctx, {
					parallel,
				});
			},
	);

const parallel = <TSchema>() =>
	createStatement(
		(raw, ctx) => () =>
			createBuilder(raw.append(tagString("PARALLEL")), ctx, {}),
	);
