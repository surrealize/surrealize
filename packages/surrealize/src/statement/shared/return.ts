import { type TaggedTemplate, tagString } from "../../query/template.ts";

export type ReturnType = "none" | "after" | "before" | "diff";

export const buildReturn = (type?: ReturnType): TaggedTemplate | undefined => {
	if (!type) return;

	switch (type) {
		case "none":
			return tagString("RETURN NONE");
		case "after":
			return tagString("RETURN AFTER");
		case "before":
			return tagString("RETURN BEFORE");
		case "diff":
			return tagString("RETURN DIFF");
		default:
			throw new Error("Invalid return type");
	}
};
