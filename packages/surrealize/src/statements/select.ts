import { QueryBuilder, RawQuery } from "../query/builder";
import type { DurationLike } from "../type/duration";
import { type TargetLike, resolveTarget } from "../type/target";
import { type Field, enforceField, enforceFields } from "../utils/field";
import { appendObject } from "../utils/object";
import type { AnySchemaOutput } from "../utils/schema";
import { Statement } from "../utils/statement";
import { type TaggedTemplate, merge, tag, tagString } from "../utils/template";
import { enforceNumber } from "../utils/value";
import { type TimeoutState, buildTimeout } from "./common/timeout";
import {
	type WhereCondition,
	type WhereState,
	buildWhere,
} from "./common/where";

export type SelectState = {
	select?: { value: false; fields: string[] } | { value: true; field: string };
	from?:
		| { only: false; targets: TargetLike[] }
		| { only: true; target: TargetLike };
	where?: WhereState;
	// split?:
	// group?:
	// order?:
	limit?: number;
	start?: number;
	// fetch?:
	timeout?: TimeoutState;
	parallel?: true;
	tempfiles?: true;
	// explain?:
};

export class SelectStatement<
	const TState extends SelectState,
	const TSchemaOutput = AnySchemaOutput,
> extends Statement<TState, TSchemaOutput> {
	/**
	 * Start a new select statement.
	 *
	 * @param fields The fields to select.
	 * @returns The select statement.
	 */
	select<const TFields extends Field[]>(...fields: TFields) {
		return new SelectStatement(
			appendObject(this.state, {
				select: {
					value: false,
					fields: enforceFields(fields),
				},
			}),
			this.options,
		);
	}

	selectValue<const TField extends Field>(field: TField) {
		return new SelectStatement(
			appendObject(this.state, {
				select: { value: true, field: enforceField(field) },
			}),
			this.options,
		);
	}

	from<const TTargets extends TargetLike[]>(...targets: TTargets) {
		return new SelectStatement(
			appendObject(this.state, { from: { only: false, targets } }),
			this.options,
		);
	}

	fromOnly<const TTarget extends TargetLike>(target: TTarget) {
		return new SelectStatement(
			appendObject(this.state, { from: { only: true, target } }),
			this.options,
		);
	}

	where<const TConditions extends WhereCondition<TSchemaOutput>[]>(
		...conditions: TConditions
	) {
		return new SelectStatement(
			appendObject(this.state, { where: { conditions } }),
			this.options,
		);
	}

	limit<const TLimit extends number>(limit: TLimit) {
		return new SelectStatement(
			appendObject(this.state, { limit }),
			this.options,
		);
	}

	start<const TStart extends number>(start: TStart) {
		return new SelectStatement(
			appendObject(this.state, { start }),
			this.options,
		);
	}

	timeout<const TTimeout extends DurationLike>(timeout: TTimeout) {
		return new SelectStatement(
			appendObject(this.state, { timeout: { timeout } }),
			this.options,
		);
	}

	parallel() {
		return new SelectStatement(
			appendObject(this.state, { parallel: true }),
			this.options,
		);
	}

	tempfiles() {
		return new SelectStatement(
			appendObject(this.state, { tempfiles: true }),
			this.options,
		);
	}

	[QueryBuilder.buildQuery](): RawQuery {
		const query = new RawQuery(
			merge([this.buildSelect(), this.buildFrom()], " "),
		);

		// where
		if (this.state.where) query.append(buildWhere(this.state.where.conditions));
		// limit
		if (this.state.limit)
			query.append(tagString(`LIMIT ${enforceNumber(this.state.limit)}`));
		// start
		if (this.state.start)
			query.append(tagString(`START ${enforceNumber(this.state.start)}`));
		// timeout
		if (this.state.timeout) query.append(buildTimeout(this.state.timeout));
		// parallel
		if (this.state.parallel) query.append(tag`PARALLEL`);
		// tempfiles
		if (this.state.tempfiles) query.append(tag`TEMPFILES`);

		return query;
	}

	private buildSelect(): TaggedTemplate {
		const select = this.state.select;
		if (!select) throw new Error("select is required");

		if (select.value)
			return tagString(`SELECT VALUE ${enforceField(select.field)}`);

		return merge(
			[
				tagString("SELECT"),
				merge(
					select.fields.map((field) => tagString(enforceField(field))),
					", ",
				),
			],
			" ",
		);
	}

	private buildFrom(): TaggedTemplate {
		const from = this.state.from;
		if (!from) throw new Error("from is required");

		if (from.only) return tagString(`FROM ONLY ${resolveTarget(from.target)}`);

		return merge(
			[
				tagString("FROM"),
				merge(
					from.targets.map((target) => tag`${resolveTarget(target)}`),
					", ",
				),
			],
			" ",
		);
	}
}
