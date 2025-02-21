export class Incrementor {
	#counter: number = -1;

	nextNumber(): number {
		return (this.#counter =
			this.#counter >= Number.MAX_SAFE_INTEGER ? 0 : this.#counter + 1);
	}

	nextString(): string {
		return this.nextNumber().toString();
	}

	reset(): void {
		this.#counter = -1;
	}
}
