import type { LiveHandler } from "surrealdb";

import type { SchemaLike } from "../../schema/types.ts";
import { parseSchema } from "../../schema/utils.ts";
import type { Surrealize } from "../../surrealize.ts";
import { EventEmitter } from "../../utils/emitter.ts";

export type LiveQueryEvents<T> = {
	create: [data: T];
	delete: [data: T];
	update: [data: T];
	close: [reason: "killed" | "disconnected"];
};

export type LiveQueryOptions<T = unknown> = {
	schema?: SchemaLike<T>;
};

export class LiveQuery<T extends unknown> extends EventEmitter<
	LiveQueryEvents<T>
> {
	private uuid: any;
	private connection: Surrealize;
	private options: LiveQueryOptions<T>;
	private killed = false;

	constructor(
		uuid: any,
		connection: Surrealize,
		options: LiveQueryOptions<T> = {},
	) {
		super();

		this.uuid = uuid;
		this.connection = connection;
		this.options = options;

		// register the handler on surreal
		this.connection.connection.subscribeLive(
			this.uuid,
			this.handler.bind(this),
		);
	}

	isKilled() {
		return this.killed;
	}

	stop(): boolean {
		// check if already stopped
		if (this.killed) return false;

		// unsubscribe from surreal
		this.connection.connection.unSubscribeLive(
			this.uuid,
			this.handler.bind(this),
		);

		// kill the live query
		this.connection.connection.kill(this.uuid);

		// set killed to `true`
		this.killed = true;

		return true;
	}

	private handler: LiveHandler = (action, result) => {
		switch (action) {
			case "CREATE":
				this.emit("create", this.parseResult(result));
				break;
			case "UPDATE":
				this.emit("update", this.parseResult(result));
				break;
			case "DELETE":
				this.emit("delete", this.parseResult(result));
				break;
			case "CLOSE":
				this.emit("close", result);
		}
	};

	private parseResult(result: unknown): T {
		if (this.options.schema) return parseSchema(this.options.schema, result);
		return result as T;
	}
}
