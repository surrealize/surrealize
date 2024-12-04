import { Uuid as SurrealUuid } from "surrealdb";

import {
	type Encodeable,
	Transformer,
} from "../query/transformer/transformer.ts";

export class UUID implements Encodeable<SurrealUuid> {
	#data: Uint8Array;

	constructor(uuid: Uint8Array) {
		if (uuid.length !== 16) throw new Error("UUID must be 16 bytes long");
		this.#data = uuid;
	}

	[Transformer.encoder]() {
		return new SurrealUuid(this.#data);
	}

	static v4(): UUID {
		return new UUID(crypto.getRandomValues(new Uint8Array(16)));
	}

	static v7(): UUID {
		return new UUID(SurrealUuid.v7().toUint8Array());
	}
}
