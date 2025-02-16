import type { ConnectionContext } from "../connection.ts";
import { AbstractEngine, ConnectionStatus } from "../engine.ts";
import { DatabaseError } from "../error.ts";
import type { RpcRequest, RpcResponse, WithId } from "../rpc.ts";
import { getIncrementalNumber } from "../utils/incremental_number.ts";
import { ManagedWebSocket } from "../utils/websocket.ts";

type WebSocketEngineConnection = {
	namespace?: string;
	database?: string;
	token?: string;
};

export class WebSocketEngine extends AbstractEngine {
	#socket: ManagedWebSocket;
	#connection: WebSocketEngineConnection = {};
	#context: ConnectionContext;

	constructor(context: ConnectionContext) {
		super();
		this.#context = context;
		this.#socket = new ManagedWebSocket(this.#getUrl(), {
			protocols: "cbor",
			timeout: this.#context.timeout,
		});

		this.#registerSocketListeners();
	}

	get status(): ConnectionStatus {
		return this.#socket.status;
	}

	get ready(): Promise<void> {
		return this.#socket.ready;
	}

	async connect(): Promise<void> {
		await this.#socket.connect();

		// if namespace or database is set, use it
		if (this.#context.namespace || this.#context.database) {
			const response = await this.rpc({
				method: "use",
				params: [this.#context.namespace, this.#context.database],
			});

			if (response.error) throw new DatabaseError(response.error);
		}

		// if auth is set, authenticate
		if (this.#context.auth) {
			let payload:
				| { NS?: string; DB?: string; user?: string; pass?: string }
				| undefined = undefined;

			const auth = this.#context.auth;

			switch (auth.type) {
				case "root":
					payload = { user: auth.username, pass: auth.password };
					break;
				case "database":
					payload = {
						NS: auth.namespace,
						DB: auth.database,
						user: auth.username,
						pass: auth.password,
					};
					break;
				case "namespace":
					payload = {
						NS: auth.namespace,
						user: auth.username,
						pass: auth.password,
					};
					break;
			}

			if (!payload) throw new Error("Invalid auth type");

			const response = await this.rpc({ method: "signin", params: [payload] });
			if (response.error) throw new DatabaseError(response.error);
		}
	}

	disconnect(): Promise<void> {
		this.#socket.disconnect();
		return Promise.resolve();
	}

	async rpc<TResult>(request: RpcRequest): Promise<RpcResponse<TResult>> {
		const id = getIncrementalNumber();
		const responsePromise = this.emitter.waitNext(`rpc-${id}`);

		await this.#socket.send(
			this.encodeCbor({
				id,
				method: request.method,
				params: request.params,
			} satisfies WithId<RpcRequest>),
		);

		const [response] = await responsePromise;
		if (response instanceof Error) throw response;

		this.#handleRequest(request, response);

		return response as RpcResponse<TResult>;
	}

	version(): Promise<string> {
		throw new Error("Failed to get version");
	}

	#handleRequest(request: RpcRequest, response: RpcResponse): void {
		if (response.error) return;

		switch (request.method) {
			case "use": {
				const [namespace, database] = request.params as [
					string | null | undefined,
					string | null | undefined,
				];

				if (namespace === null) this.#connection.namespace = undefined;
				if (database === null) this.#connection.database = undefined;
				if (namespace) this.#connection.namespace = namespace;
				if (database) this.#connection.database = database;
				break;
			}

			case "signin":
			case "signup": {
				this.#connection.token = response.result as string;
				break;
			}

			case "authenticate": {
				const [token] = request.params as [string];
				this.#connection.token = token;
				break;
			}

			case "invalidate": {
				this.#connection.token = undefined;
				break;
			}
		}
	}

	#handleResponse(response: WithId<RpcResponse> | RpcResponse): void {
		if ("id" in response) {
			this.emitter.emit(`rpc-${response.id}`, response);
		} else if (false /* is live query */) {
			// TODO live query
		} else {
			// TODO handle error
		}
	}

	#registerSocketListeners() {
		this.#socket.on("connecting", () => this.emitter.emit("connecting"));
		this.#socket.on("connected", () => this.emitter.emit("connected"));
		this.#socket.on("disconnecting", () => this.emitter.emit("disconnecting"));
		this.#socket.on("disconnected", () => this.emitter.emit("disconnected"));
		this.#socket.on("error", (error) => this.emitter.emit("error", error));

		this.#socket.on("message", async (message) => {
			try {
				const decoded = this.decodeCbor(message);

				if (
					typeof decoded === "object" &&
					decoded !== null &&
					Object.getPrototypeOf(decoded) === Object.prototype
				) {
					this.#handleResponse(decoded as WithId<RpcResponse> | RpcResponse);
				} else {
					throw new Error("Unexpected response");
				}
			} catch (error) {
				this.#socket.emit(
					"error",
					error instanceof Error ? error : new Error("Unknown error"),
				);
			}
		});
	}

	#getUrl(): URL {
		const newUrl = new URL(this.#context.url.toString());
		if (newUrl.pathname.endsWith("/rpc")) return newUrl;

		if (!newUrl.pathname.endsWith("/")) newUrl.pathname += "/";
		newUrl.pathname += "rpc";

		return newUrl;
	}
}
