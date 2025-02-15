import { RawQuery } from "./query/builder/raw.ts";
import { type Builder, createBuilder } from "./query/builder/statements.ts";
import type { Schema } from "./schema/types.ts";
import { create, createOnly } from "./statement/create.ts";
import { deleteOnly, delete_ } from "./statement/delete.ts";
import { select, selectValue } from "./statement/select.ts";
import type { Surrealize } from "./surrealize.ts";

const statements = {
	create,
	createOnly,

	delete: delete_,
	deleteOnly,

	select,
	selectValue,
};

type DefaultBuilder<TSchema = unknown> = Builder<
	{
		create: typeof create<TSchema>;
		createOnly: typeof createOnly<TSchema>;

		delete: typeof delete_<TSchema>;
		deleteOnly: typeof deleteOnly<TSchema>;

		select: typeof select<TSchema>;
		selectValue: typeof selectValue<TSchema>;
	},
	TSchema
>;

export const q: DefaultBuilder = createBuilder(new RawQuery(), {}, statements);

export const createStatements = <TSchema>(options?: {
	schema?: Schema<TSchema>;
	connection?: Surrealize;
}): DefaultBuilder<TSchema> => {
	return createBuilder(
		new RawQuery(),
		{
			schema: options?.schema,
			connection: options?.connection,
		},
		statements,
	) as DefaultBuilder<TSchema>;
};
