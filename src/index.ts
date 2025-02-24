export {
	HttpEngine,
	type HttpEngineOptions,
} from "./connection/engines/http.ts";
export {
	WebSocketEngine,
	type WebSocketEngineOptions,
} from "./connection/engines/websocket.ts";

export { createDefaultBuilder, q } from "./statements.ts";
export { Surrealize, type SurrealizeOptions } from "./surrealize.ts";

export {
	prepareQuery,
	prepareTransaction,
	resolveQuery,
} from "./query/utils.ts";
export {
	Query,
	QueryList,
	surql,
	type QueryOptions,
	type QueryListOptions,
} from "./query/query.ts";
export {
	type FormatVariableConverter,
	type TaggedTemplate,
	format,
	isEmpty,
	merge,
	tag,
	tagString,
} from "./query/template.ts";
export type {
	PreparedQuery,
	QueryLike,
	QueriesLike,
	InferQueryOutput,
	InferQueriesOutput,
} from "./query/types.ts";

export { Repository, type RepositoryOptions } from "./repository/repository.ts";
export type {
	RepositoryWhere,
	RepositoryFindByOptions,
	RepositoryFindOneByOptions,
} from "./repository/types.ts";

export * from "./statement/shared/where.ts";

export {
	Duration,
	type DurationLike,
	type DurationValue,
} from "./type/duration.ts";
export { type Record, type AnyRecord } from "./type/record.ts";
export {
	RecordId,
	type RecordIdLike,
	type RecordIdValue,
} from "./type/recordid.ts";
export { Table, type TableLike } from "./type/table.ts";
export {
	resolveTarget,
	type TargetLike,
	type ResolvedTarget,
} from "./type/target.ts";
export { UUID } from "./type/uuid.ts";

export {
	type InferStandardInput,
	type InferStandardOutput,
	ValidationError,
	type StandardSchema,
	mergeSchema,
	parseSchema,
} from "./schema/standard.ts";
export type {
	SchemaContext,
	InferInput,
	InferResult,
	AnySchemaContext,
	UnknownSchemaContext,
} from "./schema/context.ts";
export { createSchemaContext } from "./schema/utils.ts";

export { flatten, keep } from "./utils/flatten.ts";
