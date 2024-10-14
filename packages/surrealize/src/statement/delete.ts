import { QueryBuilder } from "../query/builder.ts";
import { type TaggedTemplate, merge, tag } from "../query/template.ts";
import { buildQuery } from "../query/types.ts";
import type { DurationLike } from "../type/duration.ts";
import type { RecordIdLike } from "../type/recordid.ts";
import { type TargetLike, resolveTarget } from "../type/target.ts";
import { appendObject } from "../utils/object.ts";
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

export type DeleteState = {
	delete?:
		| { only: true; target: TargetLike }
		| { only: false; targets: TargetLike[] };
	where?: WhereState;
	return?: ReturnState;
	timeout?: TimeoutState;
	parallel?: true;
};

export class DeleteStatement<
	const TState extends DeleteState,
	const TSchemaOutput = unknown,
> extends Statement<TState, TSchemaOutput> {
	delete<const TTargets extends TargetLike[]>(...targets: TTargets) {
		return new DeleteStatement(
			appendObject(this.state, { delete: { only: false, targets } }),
			this.options,
		);
	}

	deleteOnly<const TRecordId extends RecordIdLike>(target: TRecordId) {
		return new DeleteStatement(
			appendObject(this.state, { delete: { only: true, target } }),
			this.options,
		);
	}

	where<const TConditions extends WhereCondition<TSchemaOutput>[]>(
		...conditions: TConditions
	) {
		return new DeleteStatement(
			appendObject(this.state, { where: { conditions } }),
			this.options,
		);
	}

	return<const TReturn extends ReturnType>(type: TReturn) {
		return new DeleteStatement(
			appendObject(this.state, { return: { type } }),
			this.options,
		);
	}

	timeout<const TTimeout extends DurationLike>(timeout: TTimeout) {
		return new DeleteStatement(
			appendObject(this.state, { timeout: { timeout } }),
			this.options,
		);
	}

	parallel() {
		return new DeleteStatement(
			appendObject(this.state, { parallel: true }),
			this.options,
		);
	}

	[buildQuery](): QueryBuilder {
		const query = new QueryBuilder(this.buildUpdate());

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

	private buildUpdate(): TaggedTemplate {
		const delete_ = this.state.delete;
		if (!delete_) throw new Error("update is required");

		if (delete_.only) return tag`DELETE ONLY ${resolveTarget(delete_.target)}`;

		return merge(
			[
				tag`DELETE`,
				merge(
					delete_.targets.map((target) => tag`${resolveTarget(target)}`),
					", ",
				),
			],
			" ",
		);
	}
}
