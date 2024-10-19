export { Statements, q } from "./statements";
export { Surrealize, type SurrealizeOptions } from "./surrealize";

export { DEFAULT_CODECS } from "./query/transform/codecs";
export {
	Transformer,
	type TransformCodec,
	type TransformerCustomType,
	type Decodeable,
	type Encodeable,
} from "./query/transform/transformer";

export { RawQuery, QueryBuilder } from "./query/builder";
export {
	Query,
	QueryList,
	surql,
	type QueryOptions,
	type QueryListOptions,
} from "./query/query";
export type {
	CompiledQuery,
	QueryLike,
	QueriesLike,
	InferQueryOutput,
	InferQueriesOutput,
} from "./query/types";

export { Repository, type RepositoryOptions } from "./repository/repository";
export type {
	RepositoryFindWhere,
	RepositoryFindOptions,
	RepositoryFindByOptions,
	RepositoryFindOneOptions,
	RepositoryFindOneByOptions,
} from "./repository/types";

export * from "./builder/utils/where";

export {
	RecordId,
	type RecordIdLike,
	type RecordIdValue,
} from "./type/recordid";
export { Table, type TableLike } from "./type/table";
export {
	resolveTarget,
	type TargetLike,
	type ResolvedTarget,
} from "./type/target";

export {
	parseSchema,
	type SchemaFunction,
	type SchemaLike,
	type InferSchemaOutput,
} from "./utils/schema";
export {
	tag,
	tagString,
	merge,
	format,
	type TaggedTemplate,
	type FormatVariableConverter,
} from "./utils/template";
