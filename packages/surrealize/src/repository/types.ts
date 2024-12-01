import type { SchemaLike } from "../schema/types.ts";
import type { WhereCondition } from "../statement/shared/where.ts";
import type { DurationLike } from "../type/duration.ts";
import type { TargetLike } from "../type/target.ts";
import type { DeepPartial } from "../utils/object.ts";

export type RepositoryWhere<TSchemaOutput> =
	TSchemaOutput extends Record<string, unknown>
		? DeepPartial<TSchemaOutput> | WhereCondition<TSchemaOutput>[]
		: Record<string, unknown> | WhereCondition[];

export type RepositoryFindOptions<TSchemaOutput> = {
	where?: RepositoryWhere<NoInfer<TSchemaOutput>>;

	limit?: number;
	start?: number;
	parallel?: boolean;
	tempfiles?: boolean;
	timeout?: DurationLike;
};

export type RepositoryFindByOptions<TSchemaOutput> = Omit<
	RepositoryFindOptions<TSchemaOutput>,
	"where"
>;

export type RepositoryFindOneOptions<TSchemaOutput> = Omit<
	RepositoryFindOptions<TSchemaOutput>,
	"limit"
>;

export type RepositoryFindOneByOptions<TSchemaOutput> = Omit<
	RepositoryFindByOptions<TSchemaOutput>,
	"where" | "limit"
>;

export type RepositoryRawQueryOptions<TSchemaOutput> = {
	/**
	 * Indicates if only one record should be returned.
	 */
	one: boolean;

	/**
	 * The target from which to select the records.
	 *
	 * If not provided, it will default to the table of the repository.
	 */
	target?: TargetLike;

	where?: RepositoryWhere<unknown>;

	limit?: number;
	start?: number;
	parallel?: boolean;
	tempfiles?: boolean;
	timeout?: DurationLike;

	schema?: SchemaLike<TSchemaOutput>;
};
