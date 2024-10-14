import { type TaggedTemplate, tagString } from "../../query/template.ts";
import { Duration, type DurationLike } from "../../type/duration.ts";

export type TimeoutState = {
	timeout: DurationLike;
};

export const buildTimeout = (state: TimeoutState): TaggedTemplate => {
	return tagString(`TIMEOUT ${Duration.from(state.timeout).nanoseconds}ns`);
};
