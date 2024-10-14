// TODO allow nested dot notated fields
export type InferFields<TSchemaOutput = unknown> = unknown extends TSchemaOutput
	? string
	: Extract<keyof TSchemaOutput, string>;

export type FieldsReturn<TFields extends string[]> = TFields extends
	| never[]
	| []
	? ["*"]
	: TFields;

export const enforceField = <TField extends string>(field: TField): TField => {
	// TODO
	return field;
};

export const enforceFields = <const TFields extends string[]>(
	fields: TFields,
): FieldsReturn<TFields> => {
	if (fields.length === 0) return ["*"] as FieldsReturn<TFields>;
	return fields.map((field) => enforceField(field)) as FieldsReturn<TFields>;
};
