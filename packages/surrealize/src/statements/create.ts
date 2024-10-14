import { QueryBuilder, RawQuery } from "../query/builder";
import type { DurationLike } from "../type/duration";
import type { RecordIdLike } from "../type/recordid";
import { type TargetLike, resolveTarget } from "../type/target";
import { appendObject } from "../utils/object";
import type { AnySchemaOutput } from "../utils/schema";
import { Statement } from "../utils/statement";
import { type TaggedTemplate, merge, tag } from "../utils/template";
import {
	type ContentLike,
	type DataState,
	type SetLike,
	buildData,
} from "./common/data";
import {
	type ReturnState,
	type ReturnType,
	buildReturn,
} from "./common/return";
import { type TimeoutState, buildTimeout } from "./common/timeout";

export type CreateState = {
	create?:
		| { only: true; target: TargetLike }
		| { only: false; targets: TargetLike[] };
	data?: DataState;
	return?: ReturnState;
	timeout?: TimeoutState;
	parallel?: true;
};

export class CreateStatement<
	const TState extends CreateState,
	const TSchemaOutput = AnySchemaOutput,
> extends Statement<TState, TSchemaOutput> {
	create<const TTargets extends TargetLike[]>(...targets: TTargets) {
		return new CreateStatement(
			appendObject(this.state, { create: { only: false, targets } }),
			this.options,
		);
	}

	createOnly<const TRecordId extends RecordIdLike>(target: TRecordId) {
		return new CreateStatement(
			appendObject(this.state, { create: { only: true, target } }),
			this.options,
		);
	}

	content<const TContent extends ContentLike>(content: TContent) {
		return new CreateStatement(
			appendObject(this.state, { data: { type: "content", content } }),
			this.options,
		);
	}

	set<const TSet extends SetLike>(set: TSet) {
		return new CreateStatement(
			appendObject(this.state, { data: { type: "set", set } }),
			this.options,
		);
	}

	return<const TReturn extends ReturnType>(type: TReturn) {
		return new CreateStatement(
			appendObject(this.state, { return: { type } }),
			this.options,
		);
	}

	timeout<const TTimeout extends DurationLike>(timeout: TTimeout) {
		return new CreateStatement(
			appendObject(this.state, { timeout: { timeout } }),
			this.options,
		);
	}

	parallel() {
		return new CreateStatement(
			appendObject(this.state, { parallel: true }),
			this.options,
		);
	}

	[QueryBuilder.buildQuery](): RawQuery {
		const query = new RawQuery(this.buildCreate());

		// content / set
		if (this.state.data) query.append(buildData(this.state.data));

		// return
		if (this.state.return) query.append(buildReturn(this.state.return));

		// timeout
		if (this.state.timeout) query.append(buildTimeout(this.state.timeout));

		// parallel
		if (this.state.parallel) query.append(tag`PARALLEL`);

		return query;
	}

	private buildCreate(): TaggedTemplate {
		const create = this.state.create;
		if (!create) throw new Error("create is required");

		if (create.only) return tag`CREATE ONLY ${resolveTarget(create.target)}`;

		return merge(
			[
				tag`CREATE`,
				merge(
					create.targets.map((target) => tag`${resolveTarget(target)}`),
					", ",
				),
			],
			" ",
		);
	}
}
