import type {
	InferSchemaInput,
	InferSchemaOutput,
	Schema,
	UnknownSchema,
} from "../../schema/types.ts";

export type OutputField<TSchema extends Schema = UnknownSchema> =
	unknown extends InferSchemaOutput<TSchema>
		? // in case the schema output is unknown, we can't infer the fields so we allow any string
			string
		: // extract the keys of the schema output
			// TODO allow nested dot notated fields
			Extract<keyof InferSchemaOutput<TSchema>, string>;

export type InputField<TSchema extends Schema = UnknownSchema> =
	unknown extends InferSchemaInput<TSchema>
		? // in case the schema input is unknown, we can't infer the fields so we allow any string
			string
		: // extract the keys of the schema input
			// TODO allow nested dot notated fields
			Extract<keyof InferSchemaInput<TSchema>, string>;

const fieldRegex = /^([\w\d]+\.)*[\w\d]+$/;
const fieldWithWildcardRegex = /^(([\w\d]+|\*)\.)*([\w\d]+|\*)$/;

export const enforceField = <TField extends string>(
	field: TField,
	mode: "normal" | "wildcard" = "normal",
): string => {
	if (typeof field !== "string")
		throw new Error(`Invalid field: ${String(field)}`);

	switch (mode) {
		case "wildcard":
			if (fieldWithWildcardRegex.test(field)) return field;
			break;
		default:
			if (fieldRegex.test(field)) return field;
			break;
	}
	throw new Error(`Invalid field: ${field}`);
};

export const enforceFields = <const TFields extends string[]>(
	fields: TFields,
	mode: "normal" | "wildcard" = "normal",
): TFields => {
	return fields.map((field) => enforceField(field, mode)) as TFields;
};
