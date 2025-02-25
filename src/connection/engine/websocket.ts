import type { CborCodec } from "../cbor/cbor.ts";
import { AbstractEngine, ConnectionStatus } from "../engine.ts";
import { ConnectionError, DatabaseError } from "../error.ts";
import type { Auth, RpcRequest, RpcResponse, WithId } from "../types.ts";
import { Incrementor } from "../utils/incrementor.ts";
import { Jwt } from "../utils/jwt.ts";
import { handleRpcResponse } from "../utils/rpc.ts";
import { WebSocketConnection, WebSocketPool } from "../utils/websocket_pool.ts";

export type WebSocketEngineOptions = {
	namespace?: string;
	database?: string;
	auth?: Auth;

	poolSize?: number;
	readyTimeout?: number;
	reconnectTimeout?: number;

	cbor?: CborCodec;
};

export class WebSocketEngine extends AbstractEngine {
	#requestId: Incrementor = new Incrementor();
	#pool: WebSocketPool;

	constructor(url: URL | string, options: WebSocketEngineOptions = {}) {
		super({
			cbor: options.cbor,
			namespace: options.namespace,
			database: options.database,
			auth: options.auth,
		});

		this.#pool = new WebSocketPool({
			url: this.#parseUrl(url),

			protocols: "cbor",
			size: options.poolSize ?? 1,
			readyTimeout: options.readyTimeout ?? 5000,
			reconnectTimeout: options.reconnectTimeout ?? 1000,

			setupConnection: (connection) => this.#setupConnection(connection),
		});

		this.#registerEvents();
	}

	getStatus(): ConnectionStatus {
		return this.#pool.status;
	}

	async isReady(): Promise<void> {
		await this.#pool.ready;
	}

	async connect(): Promise<void> {
		this.#pool.connect();
		return this.isReady();
	}

	async disconnect(): Promise<void> {
		this.#pool.disconnect();
	}

	async rpc<TResult>(request: RpcRequest): Promise<RpcResponse<TResult>> {
		await this.isReady();

		const id = this.#requestId.nextNumber();
		const responsePromise = this.waitNext(`rpc-${id}`);

		this.#pool.send(
			this.cbor.encode({
				id,
				method: request.method,
				params: request.params,
			} satisfies WithId<RpcRequest>),
			undefined,
			// pre-hook: check for token state before sending
			(connection) => this.#checkToken(connection),
		);

		const [response] = await responsePromise;

		return response as RpcResponse<TResult>;
	}

	async #rawRpc<TResult>(request: RpcRequest, connection: WebSocketConnection) {
		const id = this.#requestId.nextNumber();
		const responsePromise = this.waitNext(`rpc-${id}`);

		connection.send(
			this.cbor.encode({
				id,
				method: request.method,
				params: request.params,
			} satisfies WithId<RpcRequest>),
		);

		const [response] = await responsePromise;
		if (response instanceof Error) throw response;

		return response as RpcResponse<TResult>;
	}

	async version(): Promise<string> {
		const res = await this.rpc<string>({ method: "version", params: [] });
		if (res.error) throw new DatabaseError(res.error);
		return res.result;
	}

	async #setupConnection(connection: WebSocketConnection): Promise<void> {
		// if namespace or database is set, use it
		if (this.options.namespace || this.options.database) {
			const response = await this.#rawRpc(
				{
					method: "use",
					params: [this.options.namespace, this.options.database],
				},
				connection,
			);

			if (response.error) throw new DatabaseError(response.error);
		}

		// authenticate if token is provided
		if (this.state.token) {
			const response = await this.#rawRpc(
				{ method: "authenticate", params: [this.state.token] },
				connection,
			);
			if (response.error) throw new DatabaseError(response.error);
		}

		return;
	}

	// move authentication stuff to the peer
	async #checkToken(connection: WebSocketConnection): Promise<void> {
		const auth = this.options.auth;

		// skip if no auth provided
		if (!auth) return;

		const jwt = connection.state.token
			? new Jwt(connection.state.token)
			: undefined;

		// if token is valid, do nothing
		if (jwt?.isValid()) return;

		if (auth.type === "token") {
			connection.state.token = auth.token;
			return;
		}

		let payload: {
			user: string;
			pass: string;
			namespace?: string;
			database?: string;
		} = {
			user: auth.username,
			pass: auth.password,
		};

		if ("namespace" in auth) {
			payload.namespace = auth.namespace;

			if ("database" in auth) {
				payload.database = auth.database;
			}
		}

		const request: RpcRequest = { method: "signin", params: [payload] };

		const response = await this.#rawRpc<string>(request, connection);

		if (response.error) throw new DatabaseError(response.error);

		connection.state.token = response.result;
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
				const decoded = this.cbor.decode(message);

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
