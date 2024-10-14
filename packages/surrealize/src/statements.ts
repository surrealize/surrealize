import { CreateStatement } from "./statements/create";
import { DeleteStatement } from "./statements/delete";
import { SelectStatement } from "./statements/select";
import { UpdateStatement } from "./statements/update";
import { UpsertStatement } from "./statements/upsert";
import type { AnySchemaOutput } from "./utils/schema";
import type { StatementOptions } from "./utils/statement";

export class Statements<TSchemaOutput = AnySchemaOutput> {
	#options: StatementOptions<TSchemaOutput>;

	/**
	 * Create typed statements with a default schema.
	 *
	 * @param schema The default schema which will be used for all statements if no schema is provided.
	 * @param defaultConnection The default connection which will be used for all statements if no connection is provided.
	 */
	constructor(options: StatementOptions<TSchemaOutput> = {}) {
		this.#options = options;
	}

	get select(): SelectStatement<Record<never, never>, TSchemaOutput>["select"] {
		return SelectStatement.prototype.select.bind(
			new SelectStatement({}, this.#options),
		);
	}

	get selectValue(): SelectStatement<
		Record<never, never>,
		TSchemaOutput
	>["selectValue"] {
		return SelectStatement.prototype.selectValue.bind(
			new SelectStatement({}, this.#options),
		);
	}

	get create(): CreateStatement<Record<never, never>, TSchemaOutput>["create"] {
		return CreateStatement.prototype.create.bind(
			new CreateStatement({}, this.#options),
		);
	}

	get createOnly(): CreateStatement<
		Record<never, never>,
		TSchemaOutput
	>["createOnly"] {
		return CreateStatement.prototype.createOnly.bind(
			new CreateStatement({}, this.#options),
		);
	}

	get update(): UpdateStatement<Record<never, never>, TSchemaOutput>["update"] {
		return UpdateStatement.prototype.update.bind(
			new UpdateStatement({}, this.#options),
		);
	}

	get updateOnly(): UpdateStatement<
		Record<never, never>,
		TSchemaOutput
	>["updateOnly"] {
		return UpdateStatement.prototype.updateOnly.bind(
			new UpdateStatement({}, this.#options),
		);
	}

	get upsert(): UpsertStatement<Record<never, never>, TSchemaOutput>["upsert"] {
		return UpsertStatement.prototype.upsert.bind(
			new UpsertStatement({}, this.#options),
		);
	}

	get upsertOnly(): UpsertStatement<
		Record<never, never>,
		TSchemaOutput
	>["upsertOnly"] {
		return UpsertStatement.prototype.upsertOnly.bind(
			new UpsertStatement({}, this.#options),
		);
	}

	get delete(): DeleteStatement<Record<never, never>, TSchemaOutput>["delete"] {
		return DeleteStatement.prototype.delete.bind(
			new DeleteStatement({}, this.#options),
		);
	}

	get deleteOnly(): DeleteStatement<
		Record<never, never>,
		TSchemaOutput
	>["deleteOnly"] {
		return DeleteStatement.prototype.deleteOnly.bind(
			new DeleteStatement({}, this.#options),
		);
	}
}

export const q = new Statements();
