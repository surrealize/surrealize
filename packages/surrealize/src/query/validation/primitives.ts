export const enforceNumber = (value: unknown): number => {
	if (typeof value !== "number")
		throw new Error(`Expected number, received: ${typeof value}`);
	return value;
};

export const enforceString = (value: unknown): string => {
	if (typeof value !== "string")
		throw new Error(`Expected string, received: ${typeof value}`);
	return value;
};
