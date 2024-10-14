import { describe, expect, test } from "bun:test";
import { RecordId } from "surrealize";

describe("RecordId", () => {
  test("constructor: string id", () => {
    const recordId = new RecordId("users", "123");

    expect(recordId.table).toEqual("users");
    expect(recordId.value).toEqual("123");
  });

  test("constructor: number id", () => {
    const recordId = new RecordId("users", 123);

    expect(recordId.table).toEqual("users");
    expect(recordId.value).toEqual(123);
  });

  test("equals", () => {
    const recordId1 = new RecordId("users", "123");
    const recordId2 = new RecordId("users", "123");
    const recordId3 = new RecordId("users", "456");

    expect(recordId1.equals(recordId2)).toBe(true);
    expect(recordId1.equals(recordId3)).toBe(false);
  });

  test("from", () => {
    expect(RecordId.from("users", "123")).toEqual(new RecordId("users", "123"));
    expect(RecordId.from("users:123")).toEqual(new RecordId("users", "123"));
    expect(RecordId.from("data", ["sensor1", 1])).toEqual(
      new RecordId("data", ["sensor1", 1]),
    );
  });
});
