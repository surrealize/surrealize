/**
 * A deep partial type which allows for deeply partially defined objects and arrays.
 */
export type DeepPartial<T> = T extends Record<string, unknown> | Array<unknown>
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 *  A type which only makes a subset of keys partial.
 */
export type PartialOnly<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

/**
 * A type which only makes a subset of keys required.
 */
export type RequiredOnly<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;
