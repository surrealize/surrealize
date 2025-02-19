import { expect } from "bun:test";
import { type Surrealize, eq, gt, q } from "surrealize";

import { insertDemoData } from "../utils.ts";

export const testSelectWhere = async (surrealize: Surrealize) => {
	await insertDemoData(surrealize);

	const result1 = await surrealize.execute(
		q
			.select()
			.from("user")
			.where([eq("name", "Alice")]),
	);
	const result2 = await surrealize.execute(
		q
			.select()
			.from("user")
			.where([gt("age", 20)]),
	);

	expect(result1).toMatchSnapshot();
	expect(result2).toMatchSnapshot();
};

export const testSelectOnly = async (surrealize: Surrealize) => {
	await insertDemoData(surrealize);

	const result1 = await surrealize.execute(q.select().fromOnly("user:bob"));

	expect(result1).toMatchSnapshot();
};
