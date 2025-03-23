export abstract class CborCodec {
	abstract encode(value: unknown): Uint8Array;
	abstract decode<T = unknown>(value: Uint8Array): T;
}
