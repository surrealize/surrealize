const textEncoder = new TextEncoder();

export const parseUint8Array = async (value: unknown): Promise<Uint8Array> => {
	if (value instanceof Uint8Array) return value;
	if (value instanceof ArrayBuffer) return new Uint8Array(value);
	if (value instanceof Blob) return new Uint8Array(await value.arrayBuffer());
	if (typeof value === "string")
		return new Uint8Array(textEncoder.encode(value));
	throw new Error("Cannot parse Uint8Array");
};
