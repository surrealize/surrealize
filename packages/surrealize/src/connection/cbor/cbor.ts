import {
	CborTag,
	type CborType,
	decodeCbor as decode,
	encodeCbor as encode,
} from "@std/cbor";

import { tags } from "./tags.ts";
import type {
	CborDecoder,
	CborEncoder,
	CborTypeDecoder,
	CborTypeEncoder,
} from "./types.ts";

export const encodeCborType: CborTypeEncoder = (value: unknown): CborType => {
	switch (typeof value) {
		case "bigint":
		case "boolean":
		case "number":
		case "string":
			return value;
		case "object": {
			// null
			if (value === null) return null;

			// array
			if (Array.isArray(value))
				return value.map((value) => encodeCborType(value));

			// raw objects
			if (Object.getPrototypeOf(value) === Object.prototype)
				return Object.fromEntries(
					Object.entries(value).map(([key, value]) => [
						key,
						encodeCborType(value),
					]),
				);
		}
	}

	// custom types
	const codec = tags.find((codec) => codec.isApplicable(value));
	if (codec) return new CborTag(codec.tag, codec.encode(value, encodeCborType));

	throw new Error("Unknown type: " + value);
};

export const decodeCborType: CborTypeDecoder = <T = unknown>(
	value: CborType,
): T => {
	switch (typeof value) {
		case "bigint":
		case "boolean":
		case "number":
		case "string":
			return value as T;
		case "object": {
			// null
			if (value === null) return null as T;

			// array
			if (Array.isArray(value))
				return value.map((value) => decodeCborType(value)) as T;

			// raw objects
			if (Object.getPrototypeOf(value) === Object.prototype)
				return Object.fromEntries(
					Object.entries(value).map(([key, value]) => [
						key,
						decodeCborType(value),
					]),
				) as T;

			break;
		}
	}

	if (value instanceof CborTag) {
		const codec = tags.find((codec) => codec.tag === value.tagNumber);
		if (!codec) throw new Error("Unknown tag: " + value.tagNumber);

		return codec.decode(value.tagContent, decodeCborType);
	}

	throw new Error("Unknown type: " + value);
};

export const encodeCbor: CborEncoder = (value: unknown): Uint8Array => {
	return encode(encodeCborType(value));
};

export const decodeCbor: CborDecoder = <T = unknown>(value: Uint8Array): T => {
	return decodeCborType(decode(value));
};
