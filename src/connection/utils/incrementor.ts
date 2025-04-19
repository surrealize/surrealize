export class Incrementor {
  #counter = -1;

  nextNumber(): number {
    this.#counter =
      this.#counter >= Number.MAX_SAFE_INTEGER ? 0 : this.#counter + 1;

    return this.#counter;
  }

  nextString(): string {
    return this.nextNumber().toString();
  }

  reset(): void {
    this.#counter = -1;
  }
}
