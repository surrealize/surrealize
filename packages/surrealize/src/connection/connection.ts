import type { EventEmitter } from "./emitter.ts";
import type {
	AbstractEngine,
	ConnectionStatus,
	EmitterEvents,
	EngineInitializer,
} from "./engine.ts";
import { WebSocketEngine } from "./engines/ws.ts";
import { DatabaseError, QueryError } from "./error.ts";
import type { RpcRequest, RpcResponse } from "./rpc.ts";
import type { Auth } from "./types.ts";

export type ConnectionContext = {
	url: URL;

	namespace?: string;
	database?: string;

	auth?: Auth;

	timeout?: number;
};

export type ConnectionOptions = {
	engines?: Record<string, EngineInitializer>;
};

export class Connection {
	#engine: AbstractEngine;

	emitter: EventEmitter<EmitterEvents>;

	constructor(context: ConnectionContext, options: ConnectionOptions = {}) {
		const engines: Record<string, EngineInitializer> = options.engines ?? {
			ws: (ctx) => new WebSocketEngine(ctx),
			wss: (ctx) => new WebSocketEngine(ctx),
		};

		const protocol = context.url.protocol.replace(":", "");
		const engine = engines[protocol];

		if (!engine) throw new Error(`Unsupported protocol ${protocol}`);

		this.#engine = engine(context);
		this.emitter = this.#engine.emitter;
	}

	get status(): ConnectionStatus {
		return this.#engine.status;
	}

	async connect(): Promise<void> {
		return this.#engine.connect();
	}

	async disconnect(): Promise<void> {
		return this.#engine.disconnect();
	}

	async rpc<TResult>(request: RpcRequest): Promise<RpcResponse<TResult>> {
		return this.#engine.rpc(request);
	}

	async query<TResult extends unknown[]>(
		query: string,
		bindings?: Record<string, unknown>,
	): Promise<TResult> {
		const response = await this.rpc<
			Array<{ result: unknown; status: "OK" | "ERR"; time: string }>
		>({
			method: "query",
			params: [query, bindings],
		});

		if (response.result) {
			const error = response.result.find((query) => query.status === "ERR");
			if (error) throw new QueryError(error.result as string);

			return response.result.map((query) => query.result) as TResult;
		} else {
			throw new DatabaseError(response.error);
		}
	}
}
