export class Jwt {
	#payload: Record<string, unknown>;

	constructor(token: string) {
		const splitted = token.split(".");
		if (splitted.length !== 3) throw new Error("Invalid token");

		const payload = splitted[1];
		if (!payload) throw new Error("Invalid token");

		this.#payload = JSON.parse(atob(payload));
	}

	get payload(): Record<string, unknown> {
		return this.#payload;
	}

	get exp(): Date {
		const exp = Number(this.#payload.exp);
		if (isNaN(exp)) throw new Error("Invalid expiration date");
		return new Date(exp * 1000);
	}
}
