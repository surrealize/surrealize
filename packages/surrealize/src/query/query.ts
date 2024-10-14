import { Surrealize } from "../surrealize";
import { type AppendedArray, appendArray } from "../utils/object";
import {
	type AnySchemaOutput,
	type SchemaLike,
	type TakeSchemaOutput,
	takeSchema,
} from "../utils/schema";
import { type TaggedTemplate, tag } from "../utils/template";
import type { InferQueriesOutput } from "./types";

export type QueryOptions<TSchemaOutput = AnySchemaOutput> = {
	/**
	 * An optional connection to use for executing the query.
	 *
	 * If not provided, the default connection will be used if available.
	 */
	connection?: Surrealize;

	/**
	 * An optional schema to use for validating the result.
	 */
	schema?: SchemaLike<TSchemaOutput>;
};

export type QueryListOptions = {
	/**
	 * An optional connection to use for executing the query.
	 *
	 * If not provided, the default connection will be used if available.
	 */
	connection?: Surrealize;
};

export class Query<TSchemaOutput = AnySchemaOutput> {
	readonly template: TaggedTemplate;
	readonly connection?: Surrealize;

	schema?: SchemaLike<TSchemaOutput>;

	constructor(
		template: TaggedTemplate,
		options: QueryOptions<TSchemaOutput> = {},
	) {
		this.template = template;
		this.schema = options.schema;
		this.connection = options.connection;
	}

	/**
	 * Create a new query with the given schema.
	 *
	 * @param schema The schema to use for the new query.
	 * @returns The new query.
	 */
	with<TWithSchema = AnySchemaOutput>(
		schema?: SchemaLike<TWithSchema>,
	): Query<TWithSchema> {
		return new Query(this.template, {
			connection: this.connection,
			schema,
		});
	}

	/**
	 * Execute the query and return the result.
	 *
	 * @param connection The surrealize connection to use for executing the query. If not provided, the default connection will be used.
	 * @returns The result of the query.
	 */
	async execute<TExecuteSchemaOutput = AnySchemaOutput>(
		options: {
			/**
			 * The surrealize connection to use for the execution.
			 *
			 * If not provided, the default connection will be used (if set).
			 */
			connection?: Surrealize;

			/**
			 * The schema to use for validating the resolved record.
			 */
			schema?: SchemaLike<TExecuteSchemaOutput>;
		} = {},
	): Promise<TakeSchemaOutput<TExecuteSchemaOutput, TSchemaOutput>> {
		const surrealize =
			options.connection ?? this.connection ?? Surrealize.default;
		if (!surrealize) throw new Error("No connection provided");

		const resolvedSchema = takeSchema(options.schema, this.schema);

		const query = (resolvedSchema ? this.with(resolvedSchema) : this) as Query<
			TakeSchemaOutput<TExecuteSchemaOutput, TSchemaOutput>
		>;

		return surrealize.execute(query);
	}
}

/**
 * A list of {@link Query}s which can be executed in a convenient way.
 */
export class QueryList<const TQueries extends Query<any>[]> {
	readonly connection?: Surrealize;

	constructor(
		readonly queries: TQueries,
		options: QueryListOptions = {},
	) {
		this.connection = options.connection;
	}

	/**
	 * Execute the queries and return the results.
	 *
	 * @param queries The queries to execute.
	 * @returns The results of the queries.
	 */
	async executeAll(
		options: {
			/**
			 * The surrealize connection to use for the execution.
			 *
			 * If not provided, the default connection will be used (if set).
			 */
			connection?: Surrealize;
		} = {},
	): Promise<InferQueriesOutput<TQueries>> {
		const surrealize =
			options.connection ?? this.connection ?? Surrealize.default;
		if (!surrealize) throw new Error("No connection provided");

		return surrealize.executeAll(this.queries);
	}

	/**
	 * Execute the queries in a transaction and return the results.
	 *
	 * Similar to `executeAll` but wraps the queries in a transaction.
	 *
	 * @param queries The queries to execute in a transaction.
	 * @returns The results of the queries.
	 */
	async executeTransaction(
		options: {
			/**
			 * The surrealize connection to use for the execution.
			 *
			 * If not provided, the default connection will be used (if set).
			 */
			connection?: Surrealize;
		} = {},
	): Promise<InferQueriesOutput<TQueries>> {
		const surrealize =
			options.connection ?? this.connection ?? Surrealize.default;
		if (!surrealize) throw new Error("No connection provided");

		return surrealize.executeTransaction(this.queries);
	}

	[Symbol.iterator](): Iterator<TQueries[number]> {
		return this.queries[Symbol.iterator]();
	}

	/**
	 * Append queries to the list without mutating the original list and returning a new list.
	 *
	 * @param queries The queries to append.
	 * @returns A new list with the appended queries.
	 */
	append<const TAppendedQueries extends Query<any>[]>(
		...queries: TAppendedQueries
	): QueryList<AppendedArray<TQueries, TAppendedQueries>> {
		return new QueryList(appendArray(this.queries, queries), {
			connection: this.connection,
		});
	}

	static from<TQueries extends Query<any>[]>(
		queries: TQueries,
	): QueryList<TQueries> {
		return new QueryList(queries);
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
