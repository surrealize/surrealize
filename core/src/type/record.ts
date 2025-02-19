import type { RecordId } from "./recordid.ts";

export type Record<TId extends RecordId> = {
	id: TId;
};

export type GraphRecord<
	TId extends RecordId,
	TIn extends RecordId,
	TOut extends RecordId,
> = {
	id: TId;
	in: TIn;
	out: TOut;
};

export type AnyRecord<TId extends RecordId> = Record<TId> & {
	[key: string]: unknown;
};

export type AnyGraphRecord<
	TId extends RecordId,
	TIn extends RecordId,
	TOut extends RecordId,
> = GraphRecord<TId, TIn, TOut> & {
	[key: string]: unknown;
};
