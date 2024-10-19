import type { AnySchemaOutput } from "./schema";

export type Field = string;

// TODO allow nested dot notated fields
export type InferFields<TSchemaOutput = AnySchemaOutput> =
	unknown extends TSchemaOutput ? string : Extract<keyof TSchemaOutput, string>;

export type FieldsReturn<TFields extends string[]> = TFields extends
	| never[]
	| []
	? ["*"]
	: TFields;

/**
 * A regex to validate a field name.
 *
 * This regex allows for dot notation.
 */
const fieldRegex = /^\w+$/;
const fieldDotRegex = /^\w+(\.\w+)*$/;
const fieldDotAsterixRegex = /^\w+(\.\w+)*(\.\*)?$/;

/**
 * Validates a field name and returns it.
 *
 * This function will throw an error if the field name is invalid.
 *
 * @param field The field name to validate.
 * @returns The validated field name.
 */
export const enforceField = <TField extends string>(
	field: TField,
	options: { mode?: "normal" | "dot" | "dotAsterix" } = {},
): TField => {
	if (field === "*") return field;

	switch (options.mode ?? "dotAsterix") {
		case "normal":
			if (fieldRegex.test(field)) return field;
			throw new Error(`Invalid field name: ${field}`);
		case "dot":
			if (fieldDotRegex.test(field)) return field;
			throw new Error(`Invalid field name: ${field}`);
		case "dotAsterix":
			if (fieldDotAsterixRegex.test(field)) return field;
			throw new Error(`Invalid field name: ${field}`);
		default:
			throw new Error("Invalid mode");
	}
};

export const enforceFields = <const TFields extends string[]>(
	fields: TFields,
	options?: { mode?: "normal" | "dot" | "dotAsterix" },
): FieldsReturn<TFields> => {
	if (fields.length === 0) return ["*"] as FieldsReturn<TFields>;
	return fields.map((field) =>
		enforceField(field, options),
	) as FieldsReturn<TFields>;
};
