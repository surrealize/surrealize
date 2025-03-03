import { Tag } from "cbor2/tag";

export type CborPrimitiveType =
	| undefined
	| null
	| boolean
	| number
	| bigint
	| string
	| Uint8Array
	| Date;

export type CborType =
	| CborPrimitiveType
	| CborTag
	| Map<CborType, CborType>
	| CborType[]
	| {
			[k: string]: CborType;
	  };

export class CborTag<T extends CborType = CborType> extends Tag {
	constructor(tag: number, content: T) {
		super(tag, content);
	}
}

export type CborTypeEncoder = (value: unknown) => CborType;
export type CborTypeDecoder = <T = unknown>(value: CborType) => T;

export type TagCodec<TValue, TEncoded extends CborType> = {
	tag: number;
	isApplicable: (value: unknown) => value is TValue;
	encode: (value: TValue, encode: CborTypeEncoder) => TEncoded;
	decode: (value: TEncoded, decode: CborTypeDecoder) => TValue;
};
