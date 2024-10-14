import type { WhereCondition } from "../builder/utils/where";
import type { DurationLike } from "../type/duration";
import type { TargetLike } from "../type/target";
import type { DeepPartial } from "../utils/object";
import type { SchemaLike } from "../utils/schema";

export type RepositoryFindWhere<TSchemaOutput> =
	TSchemaOutput extends Record<string, unknown>
		? DeepPartial<TSchemaOutput>
		: Record<string, unknown>;

export type RepositoryFindOptions<TSchemaOutput> = {
	where?:
		| RepositoryFindWhere<NoInfer<TSchemaOutput>>
		| WhereCondition<TSchemaOutput>[];

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

// Currently used
// export type RepositoryFindByIdOptions<TSchemaOutput> = Pick<
// 	RepositoryFindOptions<TSchemaOutput>,
// 	never
// >;

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

	where?: Record<string, unknown> | WhereCondition[];

	limit?: number;
	start?: number;
	parallel?: boolean;
	tempfiles?: boolean;
	timeout?: DurationLike;

	schema?: SchemaLike<TSchemaOutput>;
};
