import type { InferResult } from "../schema/context.ts";
import type { StandardSchema } from "../schema/standard.ts";
import type { WhereCondition } from "../statement/shared/where.ts";
import type { DurationLike } from "../type/duration.ts";
import type { RecordSchemaContext } from "../type/record.ts";
import type { InferTableFromSchema } from "../type/table.ts";
import type { TargetLike } from "../type/target.ts";
import type { DeepPartial } from "../utils/types.ts";

export type RepositoryWhere<TSchema extends RecordSchemaContext> =
	InferResult<TSchema> extends Record<string, unknown>
		? DeepPartial<InferResult<TSchema>> | WhereCondition<TSchema>[]
		: Record<string, unknown> | WhereCondition[];

export type RepositoryFindByOptions = {
	limit?: number;
	start?: number;
	parallel?: boolean;
	tempfiles?: boolean;
	timeout?: DurationLike;
};

export type RepositoryFindOneByOptions = Omit<RepositoryFindByOptions, "limit">;

export type RepositoryRawQueryOptions<
	TSchema extends RecordSchemaContext,
	TOutput,
> = {
	/**
	 * Indicates if only one record should be returned.
	 */
	one: boolean;

	/**
	 * The target from which to select the records.
	 *
	 * If not provided, it will default to the table of the repository.
	 */
	target?: TargetLike<InferTableFromSchema<TSchema>>;

	where?: RepositoryWhere<TSchema>;

	limit?: number;
	start?: number;
	parallel?: boolean;
	tempfiles?: boolean;
	timeout?: DurationLike;

	schema?: StandardSchema<unknown, TOutput>;
};
