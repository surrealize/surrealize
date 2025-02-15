import {
	type TaggedTemplate,
	merge,
	tag,
	tagString,
} from "../../query/template.ts";
import { type Field, enforceField } from "../../query/validation/field.ts";

export type Data<TSchema> =
	| { type: "content"; content: ContentLike<TSchema> }
	| { type: "replace"; replace: ReplaceLike<TSchema> }
	| { type: "set"; set: SetLike<TSchema> }
	| { type: "unset"; unset: UnsetLike<TSchema> }
	| { type: "merge"; merge: MergeLike<TSchema> }
	| { type: "patch"; patch: PatchLike<TSchema> };

export type ContentLike<TSchema> =
	TSchema extends Record<string, unknown> ? TSchema : Record<string, unknown>;

export type ReplaceLike<TSchema> =
	TSchema extends Record<string, unknown> ? TSchema : Record<string, unknown>;

export type SetLike<TSchema> = Record<Field<TSchema>, unknown>;

export type UnsetLike<TSchema> = Field<TSchema>[];

// TODO types
export type MergeLike<TSchema> = Record<string, unknown>;

// TODO types
export type PatchLike<TSchema> = Record<string, unknown>;

export const buildData = <TSchema>(data: Data<TSchema>): TaggedTemplate => {
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
