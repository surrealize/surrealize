import type { CborType } from "@std/cbor";

export type CborEncoder = (value: unknown) => Uint8Array;
export type CborDecoder = <T = unknown>(value: Uint8Array) => T;

export type CborTypeEncoder = (value: unknown) => CborType;
export type CborTypeDecoder = <T = unknown>(value: CborType) => T;

export type TagCodec<TValue, TEncoded extends CborType> = {
	tag: number;
	isApplicable: (value: unknown) => value is TValue;
	encode: (value: TValue, encode: CborTypeEncoder) => TEncoded;
	decode: (value: TEncoded, decode: CborTypeDecoder) => TValue;
};
