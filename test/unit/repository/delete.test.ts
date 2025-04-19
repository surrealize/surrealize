import { describe, expect, test } from "bun:test";
import { RecordId, Repository, Table, neq, surql } from "surrealize";

const table = Table.from("user");
const repo = new Repository(table);

describe("Repository delete methods", () => {
  test("delete", () => {
    const record = { id: RecordId.from("user:1"), name: "Bob" };

    expect(repo.delete(record).template).toEqual(
      surql`DELETE ${record.id}`.template,
    );
  });

  test("deleteBy", () => {
    expect(repo.deleteBy({ name: "Bob" }).template).toEqual(
      surql`DELETE ${table} WHERE (name == ${"Bob"})`.template,
    );

    expect(repo.deleteBy({ "name.first": "Alice" }).template).toEqual(
      surql`DELETE ${table} WHERE (name.first == ${"Alice"})`.template,
    );

    expect(repo.deleteBy({ name: { first: "Alice" } }).template).toEqual(
      surql`DELETE ${table} WHERE (name.first == ${"Alice"})`.template,
    );

    expect(
      repo.deleteBy([neq("name.first", "Alice"), neq("name.last", "Smith")])
        .template,
    ).toEqual(
      surql`DELETE ${table} WHERE (name.first != ${"Alice"} && name.last != ${"Smith"})`
        .template,
    );
  });

  test("deleteById", () => {
    expect(repo.deleteById(RecordId.from("user:bob")).template).toEqual(
      surql`DELETE ${RecordId.from("user:bob")}`.template,
    );
  });
});
