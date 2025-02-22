import { expect } from "bun:test";
import { type Query, type QueryLike, resolveQuery } from "surrealize";

export const expectQueryToMatchSnapshot = (query: Query) => {
	expect(query.template).toMatchSnapshot();
};

export const expectQueriesEquals = (...queryLikes: QueryLike[]) => {
	const queries = queryLikes.map(resolveQuery);

	for (let i = 0; i < queries.length - 1; i++) {
		expect(queries[i].template).toEqual(queries[i + 1].template);
	}
};
