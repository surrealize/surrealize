export { Statements, q } from "./statements.ts";
export { Surrealize, type SurrealizeOptions } from "./surrealize.ts";

export { DEFAULT_CODECS } from "./query/transformer/codecs.ts";
export {
	Transformer,
	type TransformCodec,
	type TransformerCustomType,
	type Decodeable,
	type Encodeable,
} from "./query/transformer/transformer.ts";

export {
	QueryBuilder,
	prepareQuery,
	prepareTransaction,
	resolveQuery,
} from "./query/builder.ts";
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
	RepositoryFindOptions,
	RepositoryFindByOptions,
	RepositoryFindOneOptions,
	RepositoryFindOneByOptions,
} from "./repository/types.ts";

export * from "./statement/shared/where.ts";

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

export {
	type SchemaFunction,
	type SchemaLike,
	type InferSchemaOutput,
} from "./schema/types.ts";
export { mergeSchema, parseSchema } from "./schema/utils.ts";
