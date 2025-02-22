import {
	AbstractEngine,
	ConnectionStatus,
	type EngineInit,
} from "../engine.ts";
import { ConnectionError, DatabaseError } from "../error.ts";
import type { RpcRequest, RpcResponse, WithId } from "../rpc.ts";
import { Incrementor } from "../utils/incrementor.ts";
import { handleRpcRequest, handleRpcResponse } from "../utils/rpc.ts";
import { WebSocketConnection, WebSocketPool } from "../utils/websocket_pool.ts";

export type WebSocketEngineOptions = {
	poolSize?: number;
	readyTimeout?: number;
	reconnectTimeout?: number;
};

export class WebSocketEngine extends AbstractEngine {
	#requestId: Incrementor = new Incrementor();
	#pool: WebSocketPool;

	#init: EngineInit | undefined;

	constructor(url: URL | string, options: WebSocketEngineOptions = {}) {
		super();

		this.#pool = new WebSocketPool({
			url: this.#parseUrl(url),

			protocols: "cbor",
			size: options.poolSize ?? 2,
			readyTimeout: options.readyTimeout ?? 5000,
			reconnectTimeout: options.reconnectTimeout ?? 1000,

			setupConnection: (connection) => this.#setupConnection(connection),
		});

		this.#registerEvents();
	}

	get status(): ConnectionStatus {
		return this.#pool.status;
	}

	get ready(): Promise<void> {
		return this.#pool.ready;
	}

	async connect(init: EngineInit): Promise<void> {
		this.#init = init;
		this.#pool.connect();
		return this.#pool.ready;
	}

	async disconnect(): Promise<void> {
		this.#pool.disconnect();
	}

	async rpc<TResult>(request: RpcRequest): Promise<RpcResponse<TResult>> {
		await this.ready;

		const id = this.#requestId.nextNumber();
		const responsePromise = this.waitNext(`rpc-${id}`);

		this.#pool.send(
			this.encodeCbor({
				id,
				method: request.method,
				params: request.params,
			} satisfies WithId<RpcRequest>),
		);

		const [response] = await responsePromise;

		handleRpcRequest(this.state, request, response);

		return response as RpcResponse<TResult>;
	}

	async #directRpc<TResult>(
		request: RpcRequest,
		connection: WebSocketConnection,
	) {
		const id = this.#requestId.nextNumber();
		const responsePromise = this.waitNext(`rpc-${id}`);

		connection.send(
			this.encodeCbor({
				id,
				method: request.method,
				params: request.params,
			} satisfies WithId<RpcRequest>),
		);

		const [response] = await responsePromise;
		if (response instanceof Error) throw response;

		handleRpcRequest(this.state, request, response);

		return response as RpcResponse<TResult>;
	}

	async version(): Promise<string> {
		const res = await this.rpc<string>({ method: "version", params: [] });
		if (res.error) throw new DatabaseError(res.error);
		return res.result;
	}

	async #setupConnection(connection: WebSocketConnection): Promise<void> {
		if (!this.#init) throw new Error("Cannot setup connection without context");

		// if namespace or database is set, use it
		if (this.#init.namespace || this.#init.database) {
			const response = await this.#directRpc(
				{
					method: "use",
					params: [this.#init.namespace, this.#init.database],
				},
				connection,
			);

			if (response.error) throw new DatabaseError(response.error);
		}

		// if auth is set, authenticate
		if (this.#init.auth) {
			let payload:
				| { NS?: string; DB?: string; user?: string; pass?: string }
				| undefined = undefined;

			const auth = this.#init.auth;

			switch (auth.type) {
				case "root":
					payload = { user: auth.username, pass: auth.password };
					break;
				case "namespace":
					payload = {
						NS: auth.namespace,
						user: auth.username,
						pass: auth.password,
					};
					break;
				case "database":
					payload = {
						NS: auth.namespace,
						DB: auth.database,
						user: auth.username,
						pass: auth.password,
					};
					break;
			}

			if (!payload) throw new Error("Invalid auth type");

			const response = await this.#directRpc(
				{ method: "signin", params: [payload] },
				connection,
			);
			if (response.error) throw new DatabaseError(response.error);
		}

		return Promise.resolve();
	}

	#registerEvents() {
		this.#pool.on("connecting", () => this.emit("connecting"));
		this.#pool.on("connected", () => this.emit("connected"));
		this.#pool.on("disconnected", ({ reason, wasClean }) =>
			this.emit("disconnected", new ConnectionError(reason, { wasClean })),
		);
		this.#pool.on("error", (error) => this.emit("error", error));

		this.#pool.on("message", async (message) => {
			try {
				const decoded = this.decodeCbor(message);

				if (
					typeof decoded === "object" &&
					decoded !== null &&
					Object.getPrototypeOf(decoded) === Object.prototype
				) {
					handleRpcResponse(this, decoded as WithId<RpcResponse> | RpcResponse);
				} else {
					throw new Error("Unexpected response");
				}
			} catch (error) {
				this.#pool.emit(
					"error",
					error instanceof Error ? error : new Error("Unknown error"),
				);
			}
		});
	}

	#parseUrl(url: URL | string): URL {
		const newUrl = new URL(url.toString());
		if (newUrl.pathname.endsWith("/rpc")) return newUrl;

		if (!newUrl.pathname.endsWith("/")) newUrl.pathname += "/";
		newUrl.pathname += "rpc";

		return newUrl;
	}
}
