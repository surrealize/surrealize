import {
	type TaggedTemplate,
	merge,
	tag,
	tagString,
} from "../../query/template.ts";
import {
	type InferFields,
	enforceField,
} from "../../query/validation/field.ts";

export type WhereState = {
	conditions: WhereCondition[];
};

export type CompareOperator =
	| "=" /* equals */
	| "!=" /* not equals */
	| "==" /* strict equals */
	| "~" /* like / fuzzy equals */
	| "!~" /* not like / fuzzy equals */
	| "<" /* less than */
	| "<=" /* less than or equal */
	| ">" /* greater than */
	| ">=" /* greater than or equal */;

export type WhereCondition<TSchema = unknown> =
	| WhereCompare<InferFields<TSchema>>
	| WhereAnd<TSchema>
	| WhereOr<TSchema>;

export type WhereCompare<
	TField extends string = string,
	TOperator extends CompareOperator = CompareOperator,
	TValue = unknown,
> = { type: "cmp"; field: TField; operator: TOperator; value: TValue };

export type WhereAnd<TSchema = unknown> = {
	type: "and";
	conditions: WhereCondition<TSchema>[];
};
export type WhereOr<TSchema = unknown> = {
	type: "or";
	conditions: WhereCondition<TSchema>[];
};

export const buildWhere = (conditions: WhereCondition[]): TaggedTemplate => {
	// return an empty string if there are no conditions
	if (conditions.length === 0) return tagString("");

	return merge([tag`WHERE`, formatCondition(and(...conditions))], " ");
};

const formatCondition = (condition: WhereCondition): TaggedTemplate => {
	switch (condition.type) {
		case "cmp":
			return merge(
				[
					tagString(`${enforceField(condition.field)} ${condition.operator}`),
					tag`${condition.value}`,
				],
				" ",
			);

		case "and":
			return merge([
				tagString("("),
				merge(condition.conditions.map(formatCondition), " && "),
				tagString(")"),
			]);

		case "or":
			return merge([
				tagString("("),
				merge(condition.conditions.map(formatCondition), " || "),
				tagString(")"),
			]);

		default:
			throw new Error("Invalid condition");
	}
};

/**
 * Create a `AND` condition.
 *
 * @param conditions The conditions to combine.
 * @returns The `AND` condition.
 */
export const and = <TSchema = unknown>(
	...conditions: WhereCondition<TSchema>[]
): WhereAnd<TSchema> => {
	return { type: "and", conditions };
};

/**
 * Create a `OR` condition.
 *
 * @param conditions The conditions to combine.
 * @returns The `OR` condition.
 */
export const or = <TSchema = unknown>(
	...conditions: WhereCondition<TSchema>[]
): WhereOr<TSchema> => {
	return { type: "or", conditions };
};

/**
 * Create a comparator for a field.
 *
 * @param field The field to compare.
 * @param operator The operator to use.
 * @param value The value to compare with.
 * @returns The comparator.
 */
export const cmp = <
	TField extends string,
	TOperator extends CompareOperator,
	TValue,
>(
	field: TField,
	operator: TOperator,
	value: TValue,
): WhereCompare<TField, TOperator, TValue> => ({
	type: "cmp",
	field,
	operator,
	value,
});

/**
 * Compares a field using the `==` operator. (strict equality)
 *
 * @param field The field to compare.
 * @param value The value to compare with.
 * @returns The comparator.
 */
export const eq = <TField extends string, TValue>(
	field: TField,
	value: TValue,
): WhereCompare<TField, "=", TValue> => cmp(field, "=", value);

/**
 * Compares a field using the `!=` operator. (inequality)
 *
 * @param field The field to compare.
 * @param value The value to compare with.
 * @returns The comparator.
 */
export const neq = <TField extends string, TValue>(
	field: TField,
	value: TValue,
): WhereCompare<TField, "!=", TValue> => cmp(field, "!=", value);

/**
 * Compares a field using the `==` operator. (strict equality)
 *
 * @param field The field to compare.
 * @param value The value to compare with.
 * @returns The comparator.
 */
export const eqs = <TField extends string, TValue>(
	field: TField,
	value: TValue,
): WhereCompare<TField, "==", TValue> => cmp(field, "==", value);

/**
 * Compares a field using the `>` operator. (greater than)
 *
 * @param field The field to compare.
 * @param value The value to compare with.
 * @returns The comparator.
 */
export const gt = <TField extends string, TValue>(
	field: TField,
	value: TValue,
): WhereCompare<TField, ">", TValue> => cmp(field, ">", value);

/**
 * Compares a field using the `>=` operator. (greater than or equal)
 *
 * @param field The field to compare.
 * @param value The value to compare with.
 * @returns The comparator.
 */
export const gte = <TField extends string, TValue>(
	field: TField,
	value: TValue,
): WhereCompare<TField, ">=", TValue> => cmp(field, ">=", value);

/**
 * Compares a field using the `<` operator. (less than)
 *
 * @param field The field to compare.
 * @param value The value to compare with.
 * @returns The comparator.
 */
export const lt = <TField extends string, TValue>(
	field: TField,
	value: TValue,
): WhereCompare<TField, "<", TValue> => cmp(field, "<", value);

/**
 * Compares a field using the `<=` operator. (less than or equal)
 *
 * @param field The field to compare.
 * @param value The value to compare with.
 * @returns The comparator.
 */
export const lte = <TField extends string, TValue>(
	field: TField,
	value: TValue,
): WhereCompare<TField, "<=", TValue> => cmp(field, "<=", value);
