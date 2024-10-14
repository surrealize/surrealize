import { Duration, type DurationLike } from "../../type/duration";
import { type TaggedTemplate, tagString } from "../../utils/template";

export type TimeoutState = {
	timeout: DurationLike;
};

export const buildTimeout = (state: TimeoutState): TaggedTemplate => {
	return tagString(`TIMEOUT ${Duration.from(state.timeout).nanoseconds}ns`);
};
