import { RawQuery } from "./query/builder/raw.ts";
import { type Builder, createBuilder } from "./query/builder/statements.ts";
import type { SchemaContext, UnknownSchemaContext } from "./schema/context.ts";
import { create, createOnly } from "./statement/create.ts";
import { delete as _delete, deleteOnly } from "./statement/delete.ts";
import { select, selectValue } from "./statement/select.ts";
import { update, updateOnly } from "./statement/update.ts";
import { upsert, upsertOnly } from "./statement/upsert.ts";
import type { Surrealize } from "./surrealize.ts";

const statements = {
	create,
	createOnly,

	delete: _delete,
	deleteOnly,

	select,
	selectValue,

	update,
	updateOnly,

	upsert,
	upsertOnly,
};

export type DefaultBuilder<
	TSchema extends SchemaContext = UnknownSchemaContext,
> = Builder<{
	create: typeof create<TSchema>;
	createOnly: typeof createOnly<TSchema>;

	delete: typeof _delete<TSchema>;
	deleteOnly: typeof deleteOnly<TSchema>;

	select: typeof select<TSchema>;
	selectValue: typeof selectValue<TSchema>;

	update: typeof update<TSchema>;
	updateOnly: typeof updateOnly<TSchema>;

	upsert: typeof upsert<TSchema>;
	upsertOnly: typeof upsertOnly<TSchema>;
}>;

export const q: DefaultBuilder = createBuilder(new RawQuery(), {}, statements);

export const createDefaultBuilder = <TSchema extends SchemaContext>(options?: {
	schema?: TSchema;
	connection?: Surrealize;
}): DefaultBuilder<TSchema> => {
	return createBuilder(
		new RawQuery(),
		{
			schema: options?.schema,
			connection: options?.connection,
		},
		statements,
	);
};
