import { Query, type QueryOptions } from "../query.ts";
import { type TaggedTemplate, isEmpty, merge, tagString } from "../template.ts";

/**
 * A raw query is a builder for a tagged template query.
 *
 * Every mutation returns a new {@link RawQuery} instance, so {@link RawQuery}s are immutable.
 */
export class RawQuery {
  constructor(readonly template: TaggedTemplate = tagString("")) {}

  /**
   * Append a {@link TaggedTemplate} to the current template.
   *
   * @param template The {@link TaggedTemplate} or string to append.
   * @param join The join string to use between the queries. Defaults to a space.
   * @returns A new {@link RawQuery} with the appended template.
   */
  append(template?: TaggedTemplate | string, join = " "): RawQuery {
    if (!template) return this;

    template = typeof template === "string" ? tagString(template) : template;

    // skip appending if the template is empty
    if (isEmpty(template)) return this;

    return new RawQuery(merge([this.template, template], join));
  }

  /**
   * Convert the query to a {@link Query} object which can be executed.
   *
   * @param options The options to use for the query.
   * @returns The query.
   */
  toQuery<TOutput = unknown>(options?: QueryOptions<TOutput>): Query<TOutput> {
    return new Query(this.template, options);
  }

  static empty(): RawQuery {
    return new RawQuery();
  }
}
