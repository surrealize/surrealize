import type { RawQuery } from "../query/builder/raw.ts";
import {
  type BuilderContext,
  createBuilder,
  createStatement,
  withBuilderContext,
} from "../query/builder/statements.ts";
import { merge, tag, tagString } from "../query/template.ts";
import type { SchemaContext } from "../schema/context.ts";
import type { DurationLike } from "../type/duration.ts";
import { type TargetLike, resolveTarget } from "../type/target.ts";
import {
  type ContentLike,
  type MergeLike,
  type PatchLike,
  type SetLike,
  type UnsetLike,
  buildData,
} from "./shared/data.ts";
import { type ReturnType, buildReturn } from "./shared/return.ts";
import { buildTimeout } from "./shared/timeout.ts";
import { type WhereCondition, buildWhere } from "./shared/where.ts";

const upsert = createStatement(
  <TSchema extends SchemaContext>(
    query: RawQuery,
    ctx: BuilderContext<TSchema>,
  ) =>
    (targets: TargetLike | TargetLike[]) => {
      targets = Array.isArray(targets) ? targets : [targets];

      const newQuery = query.append(
        merge(
          [
            tagString("UPSERT"),
            merge(
              targets.map((target) => tag`${resolveTarget(target)}`),
              ", ",
            ),
          ],
          " ",
        ),
        "",
      );
      return createBuilder(newQuery, ctx, {
        content: content as typeof content<TSchema>,
        merge: _merge as typeof _merge<TSchema>,
        patch: patch as typeof patch<TSchema>,
        set: set as typeof set<TSchema>,
        unset: unset as typeof unset<TSchema>,
        where: where as typeof where<TSchema>,
        return: _return as typeof _return<TSchema>,
        timeout: timeout as typeof timeout<TSchema>,
        parallel: parallel as typeof parallel<TSchema>,
      });
    },
);

const upsertOnly = createStatement(
  <TSchema extends SchemaContext>(
    query: RawQuery,
    ctx: BuilderContext<TSchema>,
  ) =>
    (target: TargetLike) =>
      createBuilder(
        query.append(tag`UPSERT ONLY ${resolveTarget(target)}`, ""),
        ctx,
        {
          content: content as typeof content<TSchema>,
          merge: _merge as typeof _merge<TSchema>,
          patch: patch as typeof patch<TSchema>,
          set: set as typeof set<TSchema>,
          unset: unset as typeof unset<TSchema>,
          where: where as typeof where<TSchema>,
          return: _return as typeof _return<TSchema>,
          timeout: timeout as typeof timeout<TSchema>,
          parallel: parallel as typeof parallel<TSchema>,
        },
      ),
);

const content = createStatement(
  <TSchema extends SchemaContext>(
    query: RawQuery,
    ctx: BuilderContext<TSchema>,
  ) =>
    (content?: ContentLike<TSchema>) =>
      createBuilder(
        query.append(
          buildData(content ? { type: "content", content } : undefined),
        ),
        ctx,
        {
          where: where as typeof where<TSchema>,
          return: _return as typeof _return<TSchema>,
          timeout: timeout as typeof timeout<TSchema>,
          parallel: parallel as typeof parallel<TSchema>,
          ...withBuilderContext<TSchema>(),
        },
      ),
);

const _merge = createStatement(
  <TSchema extends SchemaContext>(
    query: RawQuery,
    ctx: BuilderContext<TSchema>,
  ) =>
    (merge?: MergeLike<TSchema>) =>
      createBuilder(
        query.append(buildData(merge ? { type: "merge", merge } : undefined)),
        ctx,
        {
          where: where as typeof where<TSchema>,
          return: _return as typeof _return<TSchema>,
          timeout: timeout as typeof timeout<TSchema>,
          parallel: parallel as typeof parallel<TSchema>,
          ...withBuilderContext<TSchema>(),
        },
      ),
);

const patch = createStatement(
  <TSchema extends SchemaContext>(
    query: RawQuery,
    ctx: BuilderContext<TSchema>,
  ) =>
    (patch?: PatchLike<TSchema>) =>
      createBuilder(
        query.append(patch ? buildData({ type: "patch", patch }) : undefined),
        ctx,
        {
          where: where as typeof where<TSchema>,
          return: _return as typeof _return<TSchema>,
          timeout: timeout as typeof timeout<TSchema>,
          parallel: parallel as typeof parallel<TSchema>,
          ...withBuilderContext<TSchema>(),
        },
      ),
);

const set = createStatement(
  <TSchema extends SchemaContext>(
    query: RawQuery,
    ctx: BuilderContext<TSchema>,
  ) =>
    (set?: SetLike<TSchema>) =>
      createBuilder(
        query.append(buildData(set ? { type: "set", set } : undefined)),
        ctx,
        {
          unset: unset as typeof unset<TSchema>,
          where: where as typeof where<TSchema>,
          return: _return as typeof _return<TSchema>,
          timeout: timeout as typeof timeout<TSchema>,
          parallel: parallel as typeof parallel<TSchema>,
          ...withBuilderContext<TSchema>(),
        },
      ),
);

const unset = createStatement(
  <TSchema extends SchemaContext>(
    query: RawQuery,
    ctx: BuilderContext<TSchema>,
  ) =>
    (unset?: UnsetLike<TSchema>) =>
      createBuilder(
        query.append(unset ? buildData({ type: "unset", unset }) : undefined),
        ctx,
        {
          where: where as typeof where<TSchema>,
          return: _return as typeof _return<TSchema>,
          timeout: timeout as typeof timeout<TSchema>,
          parallel: parallel as typeof parallel<TSchema>,
          ...withBuilderContext<TSchema>(),
        },
      ),
);

const where = createStatement(
  <TSchema extends SchemaContext>(
    query: RawQuery,
    ctx: BuilderContext<TSchema>,
  ) =>
    (conditions?: WhereCondition<TSchema>[]) =>
      createBuilder(query.append(buildWhere(conditions)), ctx, {
        return: _return as typeof _return<TSchema>,
        timeout: timeout as typeof timeout<TSchema>,
        parallel: parallel as typeof parallel<TSchema>,
        ...withBuilderContext<TSchema>(),
      }),
);

const _return = createStatement(
  <TSchema extends SchemaContext>(
    query: RawQuery,
    ctx: BuilderContext<TSchema>,
  ) =>
    (type?: ReturnType) =>
      createBuilder(query.append(type ? buildReturn(type) : undefined), ctx, {
        timeout: timeout as typeof timeout<TSchema>,
        parallel: parallel as typeof parallel<TSchema>,
        ...withBuilderContext<TSchema>(),
      }),
);

const timeout = createStatement(
  <TSchema extends SchemaContext>(
    query: RawQuery,
    ctx: BuilderContext<TSchema>,
  ) =>
    (timeout?: DurationLike) =>
      createBuilder(query.append(buildTimeout(timeout)), ctx, {
        parallel: parallel as typeof parallel<TSchema>,
        ...withBuilderContext<TSchema>(),
      }),
);

const parallel = createStatement(
  <TSchema extends SchemaContext>(
    query: RawQuery,
    ctx: BuilderContext<TSchema>,
  ) =>
    (append = true) =>
      createBuilder(
        append ? query.append("PARALLEL") : query,
        ctx,
        withBuilderContext<TSchema>(),
      ),
);

export {
  upsert,
  upsertOnly,
  content,
  _merge as merge,
  patch,
  set,
  unset,
  where,
  _return as return,
  timeout,
  parallel,
};
