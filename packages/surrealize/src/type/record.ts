import type { RecordId, RecordIdValue } from "./recordid.ts";

export type Record<
	TTable extends string = string,
	TId extends RecordIdValue = RecordIdValue,
> = {
	id: RecordId<TTable, TId>;
};

export type AnyRecord<
	TTable extends string = string,
	TId extends RecordIdValue = RecordIdValue,
> = Record<TTable, TId> & { [key: string]: unknown };
