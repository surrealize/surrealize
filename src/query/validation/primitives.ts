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

const nameRegex = /^[a-zA-Z0-9_]+$/;

export const enforceName = (value: unknown): string => {
  if (typeof value !== "string")
    throw new Error(`Expected name, received: ${typeof value}`);

  if (!nameRegex.test(value))
    throw new Error(`Expected name, received: ${value}`);

  return value;
};
