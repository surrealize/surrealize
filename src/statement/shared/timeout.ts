import { type TaggedTemplate, tagString } from "../../query/template.ts";
import { Duration, type DurationLike } from "../../type/duration.ts";

export const buildTimeout = (
  timeout?: DurationLike,
): TaggedTemplate | undefined => {
  if (!timeout) return;
  return tagString(`TIMEOUT ${Duration.from(timeout).nanoseconds}ns`);
};
