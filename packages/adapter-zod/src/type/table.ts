import { Table } from "@surrealize/core";
import { z } from "zod";

import type { ZodCustom } from "../utils";

/**
 * The options to use for the table schema creation.
 */
export type TableTypeOptions<TTable extends string> = {
	/**
	 * An optional Zod schema to validate the name of the table
	 */
	table?: z.ZodType<TTable> | Table<TTable>;
};

/**
 * A function which creates a Zod schema for a table based on the provided options.
 *
 * @param options The options to use for the table schema.
 * @returns The Zod schema for the table.
 */
export const tableType = <TTable extends string>(
	options: TableTypeOptions<TTable> = {},
): TableType<TTable> =>
	z.custom((table) =>
		z
			.instanceof(Table)
			.superRefine((value, ctx) => {
				if (options.table) {
					// If the table input is an actual table, convert it to a zod schema.
					if (options.table instanceof Table)
						options.table = z.literal(options.table.name);

					const result = options.table.safeParse(value.name);
					if (!result.success)
						result.error.issues.map((issue) => ctx.addIssue(issue));
				}
			})
			.parse(table),
	);

/**
 * The Zod schema for a table. This type is returned by the {@link tableType} function.
 */
export type TableType<TTable extends string> = ZodCustom<Table<TTable>>;
