let incrementalNumber = -1;

export const getIncrementalNumber = (): number => {
	incrementalNumber =
		incrementalNumber >= Number.MAX_SAFE_INTEGER ? 0 : incrementalNumber + 1;

	return incrementalNumber;
};

export const parseUint8Array = async (value: unknown): Promise<Uint8Array> => {
	if (value instanceof Uint8Array) return value;
	if (value instanceof ArrayBuffer) return new Uint8Array(value);
	if (value instanceof Blob) return new Uint8Array(await value.arrayBuffer());
	throw new Error("Cannot parse Uint8Array");
};
