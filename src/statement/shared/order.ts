import { type TaggedTemplate, merge, tagString } from "../../query/template.ts";
import { type Field, enforceField } from "../../query/validation/field.ts";
import type {
  SchemaContext,
  UnknownSchemaContext,
} from "../../schema/context.ts";

const orderDirectionMapping = {
  asc: "ASC",
  ascending: "ASC",
  desc: "DESC",
  descending: "DESC",
};

const orderModeMapping = {
  collate: "COLLATE",
  numeric: "NUMERIC",
};

export type OrderDirection = keyof typeof orderDirectionMapping;
export type OrderMode = keyof typeof orderModeMapping;

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

  const template: TaggedTemplate = tagString("ORDER");

  if (fields === "rand") return merge([template, tagString("rand()")], " ");

  return merge(
    [
      template,
      merge(
        fields.map((field) =>
          typeof field === "string"
            ? tagString(enforceField(field))
            : tagString(
                `${enforceField(field.field)}${
                  field.mode && orderModeMapping[field.mode]
                    ? ` ${orderModeMapping[field.mode]}`
                    : ""
                }${
                  field.direction && orderDirectionMapping[field.direction]
                    ? ` ${orderDirectionMapping[field.direction]}`
                    : ""
                }`,
              ),
        ),
        ", ",
      ),
    ],
    " ",
  );
};
