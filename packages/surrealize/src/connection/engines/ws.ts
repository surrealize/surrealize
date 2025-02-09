import type { ConnectionContext } from "../connection.ts";
import { AbstractEngine, ConnectionStatus } from "../engine.ts";
import type { RpcRequest, RpcResponse, WithId } from "../rpc.ts";
import { getIncrementalNumber, parseUint8Array } from "../utils.ts";

type WebSocketEngineConnection = {
	namespace?: string;
	database?: string;
	token?: string;
};

export class WebSocketEngine extends AbstractEngine {
	#socket: WebSocket | undefined;
	#connection: WebSocketEngineConnection = {};
	#context: ConnectionContext;

	ready: Promise<void> = Promise.resolve(void 0);
	status: ConnectionStatus = ConnectionStatus.DISCONNECTED;

	constructor(context: ConnectionContext) {
		super();
		this.#context = context;
	}

	connect(): Promise<void> {
		if (this.#socket) throw new Error("Already connected");

		this.#socket = new WebSocket(this.#getUrl(), "cbor");

		this.#registerSocketListeners();

		this.ready = new Promise<void>((resolve, reject) => {
			const unsubscribeConnected = this.emitter.once("connected", () => {
				unsubscribeError();
				resolve();
			});

			const unsubscribeError = this.emitter.once("error", (error) => {
				unsubscribeConnected();
				reject(error);
			});
		});

		return this.ready;
	}

	async disconnect(): Promise<void> {
		this.emitter.emit("disconnecting");
		this.#socket?.close();
		this.#socket = undefined;
	}

	async rpc<TMethod extends string, TParams extends unknown[], TResult>(
		request: RpcRequest<TMethod, TParams>,
	): Promise<RpcResponse<TResult>> {
		console.log("rpc");

		if (!this.#socket) throw new Error("Not connected");

		await this.ready;

		const id = getIncrementalNumber();
		const responsePromise = this.emitter.waitNext(`rpc-${id}`);

		this.#socket.send(
			this.encodeCbor({
				id,
				method: request.method,
				params: request.params,
			} satisfies WithId<RpcRequest<TMethod, TParams>>),
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
				const [namespace, database] = response.result as [
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
		if (!this.#socket)
			throw new Error("Cannot register socket listeners without a socket");

		this.#socket.addEventListener("open", () => {
			this.status = ConnectionStatus.CONNECTED;
			this.emitter.emit("connected");
		});

		this.#socket.addEventListener("close", () => {
			this.status = ConnectionStatus.DISCONNECTED;
			this.emitter.emit("disconnected");
		});

		this.#socket.addEventListener("error", (event) => {
			if (event instanceof ErrorEvent) {
				this.emitter.emit("error", event.error);
			} else {
				this.emitter.emit("error", new Error("Unknown error"));
			}
		});

		this.#socket.addEventListener("message", async ({ data }) => {
			try {
				const decoded = this.decodeCbor(await parseUint8Array(data));

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
				this.#socket?.dispatchEvent(new ErrorEvent("error", { error }));
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
