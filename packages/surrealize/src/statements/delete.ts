import { QueryBuilder, RawQuery } from "../query/builder";
import type { DurationLike } from "../type/duration";
import type { RecordIdLike } from "../type/recordid";
import { type TargetLike, resolveTarget } from "../type/target";
import { appendObject } from "../utils/object";
import type { AnySchemaOutput } from "../utils/schema";
import { Statement } from "../utils/statement";
import { type TaggedTemplate, merge, tag } from "../utils/template";
import {
	type ReturnState,
	type ReturnType,
	buildReturn,
} from "./common/return";
import { type TimeoutState, buildTimeout } from "./common/timeout";
import {
	type WhereCondition,
	type WhereState,
	buildWhere,
} from "./common/where";

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
	const TSchemaOutput = AnySchemaOutput,
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

	[QueryBuilder.buildQuery](): RawQuery {
		const query = new RawQuery(this.buildUpdate());

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
