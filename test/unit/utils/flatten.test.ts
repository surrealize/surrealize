import { describe, expect, test } from "bun:test";

import { flatten, keep } from "../../../src/utils/flatten.ts";

describe("Flatten utils", () => {
  test("flatten", () => {
    expect(
      flatten({ test: 1, nested: { test: 2, nested: { test: 3 } } }),
    ).toEqual({ test: 1, "nested.test": 2, "nested.nested.test": 3 });

    expect(
      flatten({
        date: new Date("2023-01-01"),
        nested: { date: new Date("2023-01-01") },
      }),
    ).toEqual({
      date: new Date("2023-01-01"),
      "nested.date": new Date("2023-01-01"),
    });

    expect(flatten({ test: [1, { foo: "bar" }] })).toEqual({
      "test.0": 1,
      "test.1.foo": "bar",
    });

    expect(
      flatten({
        test: {
          foo: "bar",
          noFlatten: keep({ foo: "bar", nested: { foo: "bar" } }),
        },
      }),
    ).toEqual({
      "test.foo": "bar",
      "test.noFlatten": { foo: "bar", nested: { foo: "bar" } },
    });

    const keepMe = keep({ foo: "bar" });

    expect(flatten({ test: keepMe, nested: { test: keepMe } })).toEqual({
      test: { foo: "bar" },
      "nested.test": { foo: "bar" },
    });
  });
});
