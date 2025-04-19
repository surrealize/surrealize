import { RecordId, type RecordIdLike, type RecordIdValue } from "./recordid.ts";
import { Table, type TableLike } from "./table.ts";

/**
 * A target is either a table or a record id.
 *
 * This type represents a target in multiple ways. Like a table or a record id in string representation or in its own types.
 *
 * @example
 *
 * ```ts
 *
 * // RecordId
 * const rid1: TargetLike = "users:123";
 * const rid2: TargetLike = new RecordId("users", "123");
 * const rid3: TargetLike = RecordId.from("users", "123");
 *
 * // Table
 * const table1: TargetLike = "users";
 * const table2: TargetLike = new Table("users");
 * const table3: TargetLike = Table.from("users");
 * ```
 */
export type TargetLike<
  TTable extends string = string,
  TId extends RecordIdValue | never = RecordIdValue | never,
> = TableLike<TTable> | RecordIdLike<TTable, TId>;

/**
 * The resolved target type which infers a target like type and returns either a record id or a table depending on the target.
 *
 * This is the return type of the {@link resolveTarget} function.
 */
export type ResolvedTarget<TTarget extends TargetLike> =
  TTarget extends RecordIdLike<infer TTable, infer TId>
    ? RecordId<TTable, TId>
    : TTarget extends TableLike<infer TTable>
      ? Table<TTable>
      : never;

/**
 * Resolves a target and returns either a record id or a table depending on the target.
 *
 * @param target The target to resolve.
 * @returns The resolved target (either a record id or a table).
 */
export const resolveTarget = <TTarget extends TargetLike>(
  target: TTarget,
): ResolvedTarget<TTarget> => {
  if (target instanceof RecordId)
    return target as unknown as ResolvedTarget<TTarget>;

  if (target instanceof Table)
    return target as unknown as ResolvedTarget<TTarget>;

  if (typeof target === "string") {
    if (target.includes(":")) {
      const [table, id] = target.split(":");
      return new RecordId(table, id) as ResolvedTarget<TTarget>;
    }

    return new Table(target) as unknown as ResolvedTarget<TTarget>;
  }

  throw new Error("Invalid target");
};
