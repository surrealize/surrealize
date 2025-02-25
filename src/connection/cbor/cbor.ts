import { CborTag, type CborType, decodeCbor, encodeCbor } from "@std/cbor";

export type CborTypeEncoder = (value: unknown) => CborType;
export type CborTypeDecoder = <T = unknown>(value: CborType) => T;

export type TagCodec<TValue, TEncoded extends CborType> = {
	tag: number;
	isApplicable: (value: unknown) => value is TValue;
	encode: (value: TValue, encode: CborTypeEncoder) => TEncoded;
	decode: (value: TEncoded, decode: CborTypeDecoder) => TValue;
};

export class CborCodec {
	tags: TagCodec<any, any>[];

	constructor(customTags: TagCodec<any, any>[] = []) {
		this.tags = customTags;
	}

	encode(value: unknown): Uint8Array {
		return encodeCbor(this.#encodeType(value));
	}

	decode<T = unknown>(value: Uint8Array): T {
		return this.#decodeType<T>(decodeCbor(value));
	}

	#encodeType(value: unknown): CborType {
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
					return value.map((value) => this.#encodeType(value));

				// raw objects
				if (Object.getPrototypeOf(value) === Object.prototype)
					return Object.fromEntries(
						Object.entries(value).map(([key, value]) => [
							key,
							this.#encodeType(value),
						]),
					);
			}
		}

		// custom types
		const codec = this.tags.find((codec) => codec.isApplicable(value));
		if (codec)
			return new CborTag(
				codec.tag,
				codec.encode(value, this.#encodeType.bind(this)),
			);

		throw new Error("Unknown type: " + value);
	}

	#decodeType<T = unknown>(value: CborType): T {
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
					return value.map((value) => this.#decodeType(value)) as T;

				// raw objects
				if (Object.getPrototypeOf(value) === Object.prototype)
					return Object.fromEntries(
						Object.entries(value).map(([key, value]) => [
							key,
							this.#decodeType(value),
						]),
					) as T;

				break;
			}
		}

		if (value instanceof CborTag) {
			const codec = this.tags.find((codec) => codec.tag === value.tagNumber);
			if (!codec) throw new Error("Unknown tag: " + value.tagNumber);

			return codec.decode(value.tagContent, this.#decodeType.bind(this));
		}

		throw new Error("Unknown type: " + value);
	}
}
