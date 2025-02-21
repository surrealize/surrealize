import {
	type TaggedTemplate,
	merge,
	tag,
	tagString,
} from "../../query/template.ts";
import { type InputField, enforceField } from "../../query/validation/field.ts";
import type { InferInput, SchemaContext } from "../../schema/context.ts";

export type Data<TSchema extends SchemaContext> =
	| { type: "content"; content: ContentLike<TSchema> }
	| { type: "replace"; replace: ReplaceLike<TSchema> }
	| { type: "set"; set: SetLike<TSchema> }
	| { type: "unset"; unset: UnsetLike<TSchema> }
	| { type: "merge"; merge: MergeLike<TSchema> }
	| { type: "patch"; patch: PatchLike<TSchema> };

export type ContentLike<TSchema extends SchemaContext> =
	InferInput<TSchema> extends Record<string, unknown>
		? InferInput<TSchema>
		: Record<string, unknown>;

export type ReplaceLike<TSchema extends SchemaContext> =
	InferInput<TSchema> extends Record<string, unknown>
		? InferInput<TSchema>
		: Record<string, unknown>;

export type SetLike<TSchema extends SchemaContext> = Record<
	InputField<TSchema>,
	unknown
>;

export type UnsetLike<TSchema extends SchemaContext> = InputField<TSchema>[];

// TODO types
export type MergeLike<_TSchema extends SchemaContext> = Record<string, unknown>;

// TODO types
export type PatchLike<_TSchema extends SchemaContext> = Record<string, unknown>;

export const buildData = <TSchema extends SchemaContext>(
	data?: Data<TSchema>,
): TaggedTemplate | undefined => {
	if (!data) return;

	switch (data.type) {
		case "content":
			return tag`CONTENT ${data.content}`;
		case "replace":
			return tag`REPLACE ${data.replace}`;
		case "set":
			return merge(
				[
					tagString("SET"),
					merge(
						Object.entries(data.set).map(([field, value]) =>
							merge([tagString(`${enforceField(field)} = `), tag`${value}`]),
						),
						", ",
					),
				],
				" ",
			);
		case "unset":
			return merge(
				[
					tagString("UNSET"),
					merge(
						data.unset.map((field) => tagString(enforceField(field))),
						", ",
					),
				],
				" ",
			);
		case "merge":
			return tag`MERGE ${data.merge}`;
		case "patch":
			return tag`PATCH ${data.patch}`;
		default:
			throw new Error("Invalid data type");
	}
};
