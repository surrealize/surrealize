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

export const select = <TSchema>() =>
	createStatement((raw) => {
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

			return createBuilder(appended, { from, fromOnly });
		};
	});

export const selectValue = <TSchema>() =>
	createStatement((raw) => {
		return (
			field: InferFields<TSchema>,
		): Builder<{
			from: typeof from<TSchema>;
			fromOnly: typeof fromOnly<TSchema>;
		}> => {
			const appended = raw.append(
				tagString(`SELECT VALUE ${enforceField(field, "wildcard")}`),
			);

			return createBuilder(appended, { from, fromOnly });
		};
	});

const from = <TSchema>() =>
	createStatement(
		(raw) =>
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
					{ parallel },
				),
	);

const fromOnly = <TSchema>() =>
	createStatement(
		(raw) =>
			(
				target: TargetLike,
			): Builder<{
				parallel: typeof parallel<TSchema>;
			}> =>
				createBuilder(raw.append(tag`FROM ONLY ${resolveTarget(target)}`), {
					parallel,
				}),
	);

const parallel = <TSchema>() =>
	createStatement(
		(raw) => () => createBuilder(raw.append(tagString("PARALLEL")), {}),
	);
