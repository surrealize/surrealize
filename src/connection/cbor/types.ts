import type { CborType } from "@std/cbor";

export abstract class CborCodec {
	// TODO raw implementation here?
	// with custom tages in constructor

	abstract encode(value: unknown): Uint8Array;
	abstract decode<T = unknown>(value: Uint8Array): T;
}

export type CborTypeEncoder = (value: unknown) => CborType;
export type CborTypeDecoder = <T = unknown>(value: CborType) => T;

export type TagCodec<TValue, TEncoded extends CborType> = {
	tag: number;
	isApplicable: (value: unknown) => value is TValue;
	encode: (value: TValue, encode: CborTypeEncoder) => TEncoded;
	decode: (value: TEncoded, decode: CborTypeDecoder) => TValue;
};

export type { CborType };
