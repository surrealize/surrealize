import { expect } from "bun:test";
import { type Surrealize, q } from "surrealize";

export const insertDemoData = async (surrealize: Surrealize) => {
  const query1 = q.create("user:bob").content({ name: "Bob", age: 10 });
  const query2 = q.create("user:alice").content({ name: "Alice", age: 25 });
  const query3 = q.create("user:charlie").content({ name: "Charlie", age: 65 });

  await surrealize.executeAll([query1, query2, query3]);

  const result = await surrealize.execute(q.select().from("user"));

  expect(result).toMatchSnapshot();
};

export const cleanupDemoData = async (surrealize: Surrealize) => {
  await surrealize.executeAll([q.delete("user"), q.delete("test")]);
};
