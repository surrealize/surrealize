export const enforceNumber = (value: unknown): number => {
	if (typeof value !== "number")
		throw new Error(`Enforced number, received: ${value}`);
	return value;
};
