import { type TaggedTemplate, tagString } from "../../query/template.ts";

export type ReturnType = "none" | "after" | "before" | "diff";

export type ReturnState = { type: ReturnType };

export const buildReturn = (state: ReturnState): TaggedTemplate => {
	switch (state.type) {
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
