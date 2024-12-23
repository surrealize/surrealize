import { QueryBuilder } from "../query/builder.ts";
import {
	type TaggedTemplate,
	merge,
	tag,
	tagString,
} from "../query/template.ts";
import { buildQuery } from "../query/types.ts";
import { enforceField, enforceFields } from "../query/validation/field.ts";
import { enforceNumber } from "../query/validation/primitives.ts";
import type { DurationLike } from "../type/duration.ts";
import { type TargetLike, resolveTarget } from "../type/target.ts";
import { appendObject } from "../utils/object.ts";
import { Statement } from "./shared/statement.ts";
import { type TimeoutState, buildTimeout } from "./shared/timeout.ts";
import {
	type WhereCondition,
	type WhereState,
	buildWhere,
} from "./shared/where.ts";

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
	fetch?: string[];
	timeout?: TimeoutState;
	parallel?: true;
	tempfiles?: true;
	// explain?:
};

export class SelectStatement<
	const TState extends SelectState,
	const TSchemaOutput = unknown,
> extends Statement<TState, TSchemaOutput> {
	/**
	 * Start a new select statement.
	 *
	 * @param fields The fields to select.
	 * @returns The select statement.
	 */
	select<const TFields extends string[]>(...fields: TFields) {
		return new SelectStatement(
			appendObject(this.state, {
				select: {
					value: false,
					fields,
				},
			}),
			this.options,
		);
	}

	selectValue<const TField extends string>(field: TField) {
		return new SelectStatement(
			appendObject(this.state, {
				select: { value: true, field },
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

	fetch<const TFields extends string[]>(...fetch: TFields) {
		return new SelectStatement(
			appendObject(this.state, { fetch }),
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

	[buildQuery](): QueryBuilder {
		const query = new QueryBuilder(
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
		// fetch
		if (this.state.fetch && this.state.fetch.length > 0)
			query.append(
				tagString(`FETCH ${enforceFields(this.state.fetch).join(", ")}`),
			);
		// timeout
		if (this.state.timeout) query.append(buildTimeout(this.state.timeout));
		// parallel
		if (this.state.parallel) query.append(tagString("PARALLEL"));
		// tempfiles
		if (this.state.tempfiles) query.append(tagString("TEMPFILES"));

		return query;
	}

	private buildSelect(): TaggedTemplate {
		const select = this.state.select;
		if (!select) throw new Error("select is required");

		if (select.value)
			return tagString(
				`SELECT VALUE ${enforceField(select.field, "wildcard")}`,
			);

		return tagString(
			`SELECT ${select.fields.length === 0 ? "*" : enforceFields(select.fields, "wildcard").join(", ")}`,
		);
	}

	private buildFrom(): TaggedTemplate {
		const from = this.state.from;
		if (!from) throw new Error("from is required");

		if (from.only) return tag`FROM ONLY ${resolveTarget(from.target)}`;

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
