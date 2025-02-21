import type { StandardSchema } from "../schema/standard.ts";
import { Surrealize } from "../surrealize.ts";
import { type TaggedTemplate, tag } from "./template.ts";
import type { InferQueriesOutput } from "./types.ts";

export type QueryOptions<TOutput = unknown> = {
	/**
	 * An optional connection to use for executing the query.
	 *
	 * If not provided, the default connection will be used if available.
	 */
	connection?: Surrealize;

	/**
	 * An optional schema to use for validating the result.
	 */
	schema?: StandardSchema<unknown, TOutput>;
};

export type QueryListOptions = {
	/**
	 * An optional connection to use for executing the query.
	 *
	 * If not provided, the default connection will be used if available.
	 */
	connection?: Surrealize;
};

export class Query<TOutput = unknown> {
	readonly template: TaggedTemplate;
	readonly connection?: Surrealize;

	schema?: StandardSchema<unknown, TOutput>;

	constructor(template: TaggedTemplate, options: QueryOptions<TOutput> = {}) {
		this.template = template;
		this.connection = options.connection;
		this.schema = options.schema;
	}

	withConnection(connection: Surrealize): Query<TOutput> {
		return new Query(this.template, {
			connection,
			schema: this.schema,
		});
	}

	withSchema<TWithOutput = unknown>(
		schema?: StandardSchema<unknown, TWithOutput>,
	): Query<TWithOutput> {
		return new Query(this.template, {
			connection: this.connection,
			schema,
		});
	}

	with<TWithOutput = unknown>(
		options?: QueryOptions<TWithOutput>,
	): Query<TWithOutput> {
		return new Query(this.template, options);
	}

	async execute(): Promise<TOutput> {
		const connection = this.connection ?? Surrealize.default;
		if (!connection) throw new Error("No connection provided");

		return connection.execute(this);
	}
}

export class QueryList<const TQueries extends Query<any>[]> {
	readonly connection?: Surrealize;

	constructor(
		readonly queries: TQueries,
		options: QueryListOptions = {},
	) {
		this.connection = options.connection;
	}

	withConnection(connection: Surrealize): QueryList<TQueries> {
		return new QueryList(this.queries, {
			connection,
		});
	}

	async executeAll(): Promise<InferQueriesOutput<TQueries>> {
		const connection = this.connection ?? Surrealize.default;
		if (!connection) throw new Error("No connection provided");

		return connection.executeAll(this.queries);
	}

	async executeTransaction(): Promise<InferQueriesOutput<TQueries>> {
		const connection = this.connection ?? Surrealize.default;
		if (!connection) throw new Error("No connection provided");

		return connection.executeTransaction(this.queries);
	}
}

/**
 * Create a query using a tagged template.
 *
 * @returns The query.
 */
export const surql = (
	strings: string[] | TemplateStringsArray,
	...values: unknown[]
): Query => {
	return new Query(tag(strings, ...values));
};
