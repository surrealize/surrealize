import type { SchemaContext } from "../schema/context.ts";
import type { PartialOnly, RequiredOnly } from "../utils/types.ts";
import type { RecordId } from "./recordid.ts";

export type OptionalId<TRecord extends Record<string, unknown>> = PartialOnly<
	TRecord,
	"id"
>;

export type RequiredId<TRecord extends Record<string, unknown>> = RequiredOnly<
	TRecord,
	"id"
>;

type _Record<TId extends RecordId = RecordId> = {
	id: TId;
};
export type { _Record as Record };

export type RelationRecord<
	TId extends RecordId = RecordId,
	TIn extends RecordId = RecordId,
	TOut extends RecordId = RecordId,
> = {
	id: TId;
	in: TIn;
	out: TOut;
};

export type AnyRecord<TId extends RecordId = RecordId> = _Record<TId> & {
	[key: string]: unknown;
};

export type AnyRelationRecord<
	TId extends RecordId = RecordId,
	TIn extends RecordId = RecordId,
	TOut extends RecordId = RecordId,
> = RelationRecord<TId, TIn, TOut> & {
	[key: string]: unknown;
};

export type RecordSchemaContext<TRecordId extends RecordId = RecordId> =
	SchemaContext<AnyRecord<TRecordId>>;
