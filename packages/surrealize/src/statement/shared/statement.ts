import type { QueryBuilder } from "../../query/builder.ts";
import type { Query } from "../../query/query.ts";
import { buildQuery, toQuery } from "../../query/types.ts";
import type { SchemaLike } from "../../schema/types.ts";
import type { Surrealize } from "../../surrealize.ts";

export type StatementOptions<TSchema> = {
	/**
	 * An optional connection to use for executing the query.
	 *
	 * If not provided, the default connection will be used if available.
	 */
	connection?: Surrealize;

	/**
	 * An optional schema to use for validating the result.
	 */
	schema?: SchemaLike<TSchema>;
};

export abstract class Statement<
	const TState extends Record<string, unknown> = Record<never, never>,
	const TSchemaOutput = unknown,
> {
	readonly state: TState;
	readonly options: StatementOptions<TSchemaOutput>;

	constructor(state: TState, options: StatementOptions<TSchemaOutput> = {}) {
		this.state = Object.freeze(state);
		this.options = options;
	}

	toQuery(): Query<TSchemaOutput> {
		return this[buildQuery]().toQuery({
			schema: this.options.schema,
			connection: this.options.connection,
		});
	}

	[toQuery](): Query<TSchemaOutput> {
		return this.toQuery();
	}

	abstract [buildQuery](): QueryBuilder;
}
