import type { z } from "zod";

/**
 * Shorthand for creating a Zod custom type.
 */
export type ZodCustom<T> = z.ZodType<T, z.ZodTypeDef, T>;
