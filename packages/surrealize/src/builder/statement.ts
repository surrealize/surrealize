import { QueryBuilder, type RawQuery } from "../query/builder";
import type { Query, QueryOptions } from "../query/query";
import type { Surrealize } from "../surrealize";
import {
	type AnySchemaOutput,
	type SchemaLike,
	type TakeSchemaOutput,
	takeSchema,
} from "../utils/schema";

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
	const TSchemaOutput = AnySchemaOutput,
> {
	readonly state: Partial<TState>;
	readonly options: StatementOptions<TSchemaOutput>;

	constructor(
		state?: Partial<TState>,
		options: StatementOptions<TSchemaOutput> = {},
	) {
		this.state = Object.freeze(state ? state : {});
		this.options = options;
	}

	toQuery<const TQuerySchema = AnySchemaOutput>(
		options: QueryOptions<TQuerySchema> = {},
	): Query<TakeSchemaOutput<TQuerySchema, TSchemaOutput>> {
		const resolvedSchema = takeSchema(options.schema, this.options.schema);

		return this[QueryBuilder.buildQuery]().toQuery({
			schema: resolvedSchema,
			connection: this.options.connection,
		}) as Query<TakeSchemaOutput<TQuerySchema, TSchemaOutput>>;
	}

	[QueryBuilder.toQuery](): Query<TSchemaOutput> {
		return this[QueryBuilder.buildQuery]().toQuery({
			schema: this.options.schema,
			connection: this.options.connection,
		});
	}

	abstract [QueryBuilder.buildQuery](): RawQuery;
}
