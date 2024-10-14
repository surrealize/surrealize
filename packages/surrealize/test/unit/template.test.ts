import { describe, expect, test } from "bun:test";
import { format, merge, tag, tagString } from "surrealize";

describe("tagged template", () => {
	test("tag", () => {
		expect(tag`Hello`).toEqual([["Hello"], []]);
		expect(tag`Hello ${"World"}!`).toEqual([["Hello ", "!"], ["World"]]);
		expect(tag`Hello ${"World"}! ${false}`).toEqual([
			["Hello ", "! ", ""],
			["World", false],
		]);
		expect(tag`Hello ${"World"}! ${false} ${{ a: 1 }}`).toEqual([
			["Hello ", "! ", " ", ""],
			["World", false, { a: 1 }],
		]);
	});

	test("tagString", () => {
		expect(tagString("Hello")).toEqual([["Hello"], []]);
		expect(tagString(`Hello ${"World"}`)).toEqual([["Hello World"], []]);
	});

	test("merge", () => {
		expect(merge([tag`Hello ${"World"}!`, tag`Foo ${"Bar"}?`], " ")).toEqual([
			["Hello ", "! Foo ", "?"],
			["World", "Bar"],
		]);

		expect(merge([tag`Hello ${"World"}!`, tag`Foo ${"Bar"}?`], "#")).toEqual([
			["Hello ", "!#Foo ", "?"],
			["World", "Bar"],
		]);
	});

	test("format", () => {
		expect(format(tag`Hello ${"World"}!`)).toEqual("Hello World!");
		expect(
			format(tag`Hello ${"World"}!`, (v) => String(v).toUpperCase()),
		).toEqual("Hello WORLD!");
		expect(format(tag`Hello ${"World"}!`, () => "Foo Bar")).toEqual(
			"Hello Foo Bar!",
		);
	});
});
