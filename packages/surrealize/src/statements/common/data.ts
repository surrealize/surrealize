import type { Encodeable } from "../../query/transform/transformer";
import { enforceField } from "../../utils/field";
import {
	type TaggedTemplate,
	merge,
	tag,
	tagString,
} from "../../utils/template";

export type DataState =
	| { type: "content"; content: ContentLike }
	| { type: "set"; set: SetLike }
	| { type: "merge"; merge: MergeLike }
	| { type: "patch"; patch: PatchLike };

export type ContentLike = Record<string, unknown> | Encodeable;
export type SetLike = Record<string, unknown>;
export type MergeLike = Record<string, unknown>;
export type PatchLike = Record<string, unknown>;

export const buildData = (dataState: DataState): TaggedTemplate => {
	switch (dataState.type) {
		case "content":
			return tag`CONTENT ${dataState.content}`;
		case "set":
			return merge(
				[
					tagString("SET"),
					merge(
						Object.entries(dataState.set).map(([field, value]) =>
							merge([tagString(`${enforceField(field)} = `), tag`${value}`]),
						),
						", ",
					),
				],
				" ",
			);
		case "merge":
			return tag`MERGE ${dataState.merge}`;
		case "patch":
			return tag`PATCH ${dataState.patch}`;
		default:
			throw new Error("Invalid data type");
	}
};
