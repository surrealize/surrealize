import { type TaggedTemplate, merge, tagString } from "../../query/template.ts";
import { type Field, enforceField } from "../../query/validation/field.ts";
import type {
	SchemaContext,
	UnknownSchemaContext,
} from "../../schema/context.ts";

export type OrderDirection = "ASC" | "DESC";
export type OrderMode = "COLLATE" | "NUMERIC";

export type OrderFieldOptions<TSchema extends SchemaContext> = {
	field: Field<TSchema>;
	mode?: OrderMode;
	direction?: OrderDirection;
};

export type OrderFields<TSchema extends SchemaContext = UnknownSchemaContext> =
	| "rand"
	| Array<Field<TSchema> | OrderFieldOptions<TSchema>>;

export const buildOrder = <TSchema extends SchemaContext>(
	fields?: OrderFields<TSchema>,
): TaggedTemplate | undefined => {
	if (!fields) return;

	let template: TaggedTemplate = tagString("ORDER");

	if (fields === "rand") return merge([template, tagString("rand()")], " ");

	return merge(
		[
			template,
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
		],
		" ",
	);
};
