const nanosecond = 1n;
const microsecond = nanosecond * 1000n;
const millisecond = microsecond * 1000n;
const second = millisecond * 1000n;
const minute = second * 60n;
const hour = minute * 60n;
const day = hour * 24n;
const week = day * 7n;
const year = day * 365n;

const DURATIONS = {
  ns: nanosecond,
  us: microsecond,
  µs: microsecond,
  ms: millisecond,
  s: second,
  m: minute,
  h: hour,
  d: day,
  w: week,
  y: year,
};

type DurationUnit = keyof typeof DURATIONS;
type DurationValueUnit<TUnit extends DurationUnit> = `${number}${TUnit}` | ``;

export type DurationValue =
  `${DurationValueUnit<"y">}${DurationValueUnit<"w">}${DurationValueUnit<"d">}${DurationValueUnit<"h">}${DurationValueUnit<"m">}${DurationValueUnit<"s">}${DurationValueUnit<"ms">}${DurationValueUnit<"µs">}${DurationValueUnit<"us">}${DurationValueUnit<"ns">}`;

export type DurationLike = DurationValue | Duration | bigint | number;

const durationPartRegex = /([0-9]+)([a-z]+)/g;

export class Duration {
  #nanoseconds: bigint;

  /**
   * Create a new duration.
   *
   * @param duration The duration in nanoseconds.
   */
  constructor(duration: bigint) {
    this.#nanoseconds = duration;
  }

  add(duration: DurationLike): Duration {
    return new Duration(
      this.#nanoseconds + Duration.from(duration).#nanoseconds,
    );
  }

  substract(duration: DurationLike): Duration {
    return new Duration(
      this.#nanoseconds - Duration.from(duration).#nanoseconds,
    );
  }

  get nanoseconds(): bigint {
    return this.#nanoseconds;
  }

  get milliseconds(): bigint {
    return this.#nanoseconds / millisecond;
  }

  get microseconds(): bigint {
    return this.#nanoseconds / microsecond;
  }

  get seconds(): bigint {
    return this.#nanoseconds / second;
  }

  get minutes(): bigint {
    return this.#nanoseconds / minute;
  }

  get hours(): bigint {
    return this.#nanoseconds / hour;
  }

  get days(): bigint {
    return this.#nanoseconds / day;
  }

  get weeks(): bigint {
    return this.#nanoseconds / week;
  }

  get years(): bigint {
    return this.#nanoseconds / year;
  }

  /**
   * Create a new duration from a value and an unit.
   *
   * @param value The value as a number or bigint.
   * @param unit The unit of the duration.
   * @returns The duration.
   */
  static from(value: bigint | number, unit: DurationUnit): Duration;

  /**
   * Create a new duration from a duration like input.
   *
   * @param duration The input duration can be a duration string (e.g. `1y2w3d4h5m6s7ms8µs9ns`),
   *                 a number/bigint (in milliseconds) or a duration object itself.
   * @returns The duration.
   */
  static from(duration: DurationLike): Duration;

  static from(duration: DurationLike, unit?: DurationUnit): Duration {
    if (!unit) {
      if (typeof duration === "bigint")
        return new Duration(duration * millisecond);
      if (typeof duration === "number")
        return new Duration(BigInt(duration) * millisecond);
      if (typeof duration === "string") return Duration.parseString(duration);
      if (duration instanceof Duration) return duration;

      throw new Error("Invalid duration");
    }

    if (typeof duration !== "bigint" && typeof duration !== "number")
      throw new Error("Invalid duration");

    return new Duration(BigInt(duration) * DURATIONS[unit]);
  }

  /**
   * Parse a duration string into a duration object.
   *
   * @param duration The duration string (e.g. `1y2w3d4h5m6s7ms8µs9ns`)
   * @returns The duration.
   */
  static parseString(duration: DurationValue): Duration {
    const matches = Array.from(duration.matchAll(durationPartRegex));

    const nanoseconds = matches.reduce((acc, [, valueString, unitString]) => {
      const value = BigInt(valueString);
      const unit = unitString as DurationUnit;

      return acc + value * DURATIONS[unit];
    }, 0n);

    return new Duration(nanoseconds);
  }

  static zero(): Duration {
    return new Duration(0n);
  }

  static years(value: number | bigint): Duration {
    return Duration.from(value, "y");
  }

  static weeks(value: number | bigint): Duration {
    return Duration.from(value, "w");
  }

  static days(value: number | bigint): Duration {
    return Duration.from(value, "d");
  }

  static hours(value: number | bigint): Duration {
    return Duration.from(value, "h");
  }

  static minutes(value: number | bigint): Duration {
    return Duration.from(value, "m");
  }

  static seconds(value: number | bigint): Duration {
    return Duration.from(value, "s");
  }

  static milliseconds(value: number | bigint): Duration {
    return Duration.from(value, "ms");
  }

  static microseconds(value: number | bigint): Duration {
    return Duration.from(value, "µs");
  }

  static nanoseconds(value: number | bigint): Duration {
    return Duration.from(value, "ns");
  }
}
