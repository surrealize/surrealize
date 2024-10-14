import { QueryBuilder } from "../query/builder.ts";
import { type TaggedTemplate, merge, tag } from "../query/template.ts";
import { buildQuery } from "../query/types.ts";
import type { DurationLike } from "../type/duration.ts";
import type { RecordIdLike } from "../type/recordid.ts";
import { type TargetLike, resolveTarget } from "../type/target.ts";
import { appendObject } from "../utils/object.ts";
import {
	type ContentLike,
	type DataState,
	type MergeLike,
	type PatchLike,
	type SetLike,
	buildData,
} from "./shared/data.ts";
import {
	type ReturnState,
	type ReturnType,
	buildReturn,
} from "./shared/return.ts";
import { Statement } from "./shared/statement.ts";
import { type TimeoutState, buildTimeout } from "./shared/timeout.ts";
import {
	type WhereCondition,
	type WhereState,
	buildWhere,
} from "./shared/where.ts";

export type UpsertState = {
	upsert?:
		| { only: true; target: TargetLike }
		| { only: false; targets: TargetLike[] };
	data?: DataState;
	where?: WhereState;
	return?: ReturnState;
	timeout?: TimeoutState;
	parallel?: true;
};

export class UpsertStatement<
	const TState extends UpsertState,
	const TSchemaOutput = unknown,
> extends Statement<TState, TSchemaOutput> {
	upsert<const TTargets extends TargetLike[]>(...targets: TTargets) {
		return new UpsertStatement(
			appendObject(this.state, { upsert: { only: false, targets } }),
			this.options,
		);
	}

	upsertOnly<const TRecordId extends RecordIdLike>(target: TRecordId) {
		return new UpsertStatement(
			appendObject(this.state, { upsert: { only: true, target } }),
			this.options,
		);
	}

	content<const TContent extends ContentLike>(content: TContent) {
		return new UpsertStatement(
			appendObject(this.state, { data: { type: "content", content } }),
			this.options,
		);
	}

	set<const TSet extends SetLike>(set: TSet) {
		return new UpsertStatement(
			appendObject(this.state, { data: { type: "set", set } }),
			this.options,
		);
	}

	merge<const TMerge extends MergeLike>(merge: TMerge) {
		return new UpsertStatement(
			appendObject(this.state, { data: { type: "merge", merge } }),
			this.options,
		);
	}

	patch<const TPatch extends PatchLike>(patch: TPatch) {
		return new UpsertStatement(
			appendObject(this.state, { data: { type: "patch", patch } }),
			this.options,
		);
	}

	where<const TConditions extends WhereCondition<TSchemaOutput>[]>(
		...conditions: TConditions
	) {
		return new UpsertStatement(
			appendObject(this.state, { where: { conditions } }),
			this.options,
		);
	}

	return<const TReturn extends ReturnType>(type: TReturn) {
		return new UpsertStatement(
			appendObject(this.state, { return: { type } }),
			this.options,
		);
	}

	timeout<const TTimeout extends DurationLike>(timeout: TTimeout) {
		return new UpsertStatement(
			appendObject(this.state, { timeout: { timeout } }),
			this.options,
		);
	}

	parallel() {
		return new UpsertStatement(
			appendObject(this.state, { parallel: true }),
			this.options,
		);
	}

	[buildQuery](): QueryBuilder {
		const query = new QueryBuilder(this.buildUpsert());

		// content / set
		if (this.state.data) query.append(buildData(this.state.data));

		// where
		if (this.state.where) query.append(buildWhere(this.state.where.conditions));

		// return
		if (this.state.return) query.append(buildReturn(this.state.return));

		// timeout
		if (this.state.timeout) query.append(buildTimeout(this.state.timeout));

		// parallel
		if (this.state.parallel) query.append(tag`PARALLEL`);

		return query;
	}

	private buildUpsert(): TaggedTemplate {
		const upsert = this.state.upsert;
		if (!upsert) throw new Error("upsert is required");

		if (upsert.only) return tag`UPSERT ONLY ${resolveTarget(upsert.target)}`;

		return merge(
			[
				tag`UPSERT`,
				merge(
					upsert.targets.map((target) => tag`${resolveTarget(target)}`),
					", ",
				),
			],
			" ",
		);
	}
}
