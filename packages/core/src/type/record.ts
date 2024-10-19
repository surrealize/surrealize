import type { RecordId, RecordIdValue } from "./recordid";

export type Record<
	TTable extends string = string,
	TId extends RecordIdValue = RecordIdValue,
> = {
	id: RecordId<TTable, TId>;
};
