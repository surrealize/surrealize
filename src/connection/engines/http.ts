import {
	AbstractEngine,
	ConnectionStatus,
	type EngineInit,
} from "../engine.ts";
import { ConnectionError, DatabaseError } from "../error.ts";
import type { RpcRequest, RpcResponse, WithId } from "../rpc.ts";
import type { Auth } from "../types.ts";
import { handleRpcRequest, handleRpcResponse } from "../utils/rpc.ts";

export type HttpEngineOptions = {
	/**
	 * Custom headers to send with every request.
	 */
	headers?: HeadersInit;
};

export class HttpEngine extends AbstractEngine {
	url: URL;

	#options: HttpEngineOptions;

	constructor(url: URL | string, options: HttpEngineOptions = {}) {
		super();

		this.#options = options;
		this.url = this.#parseUrl(url);
	}

	get status(): ConnectionStatus {
		return ConnectionStatus.CONNECTED;
	}

	get ready(): Promise<void> {
		return Promise.resolve();
	}

	async connect(init: EngineInit): Promise<void> {
		this.state = {
			namespace: init.namespace,
			database: init.database,
		};

		if (init.auth) this.state.token = await this.#signIn(init.auth);

		return this.ready;
	}

	async #signIn(auth: Auth): Promise<string> {
		if (auth.type === "token") return auth.token;

		let payload = undefined;

		switch (auth.type) {
			case "root":
				payload = {
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
			case "database":
				payload = {
					NS: auth.namespace,
					DB: auth.database,
					user: auth.username,
					pass: auth.password,
				};
				break;
		}

		const response = await this.rpc({
			method: "signin",
			params: [payload],
		});

		if (response.error) throw new DatabaseError(response.error);

		return response.result as string;
	}

	async disconnect(): Promise<void> {
		this.state = {};
	}

	async rpc<TResult>(request: RpcRequest): Promise<RpcResponse<TResult>> {
		await this.ready;

		const httpResponse = await fetch(this.url, {
			method: "POST",
			headers: this.#createHeaders(),
			body: this.encodeCbor({
				method: request.method,
				params: request.params,
			} satisfies RpcRequest),
		});

		if (!httpResponse.ok)
			throw new ConnectionError(
				"HTTP error: " + httpResponse.status,
				httpResponse,
			);

		const response = await httpResponse
			.arrayBuffer()
			.then((buffer) => this.decodeCbor(new Uint8Array(buffer)));

		if (
			!(
				typeof response === "object" &&
				response !== null &&
				Object.getPrototypeOf(response) === Object.prototype
			)
		)
			throw new ConnectionError("Unexpected response", httpResponse);

		handleRpcResponse(this, response as WithId<RpcResponse> | RpcResponse);
		handleRpcRequest(this.state, request, response as RpcResponse);

		return response as RpcResponse<TResult>;
	}

	async version(): Promise<string> {
		const res = await this.rpc<string>({ method: "version", params: [] });
		if (res.error) throw new DatabaseError(res.error);
		return res.result;
	}

	#createHeaders(): Headers {
		const headers = new Headers(this.#options.headers);
		headers.set("Content-Type", "application/cbor");
		headers.set("Accept", "application/cbor");

		if (this.state.namespace) headers.set("Surreal-NS", this.state.namespace);
		if (this.state.database) headers.set("Surreal-DB", this.state.database);
		if (this.state.token)
			headers.set("Authorization", `Bearer ${this.state.token}`);

		return headers;
	}

	#parseUrl(url: URL | string): URL {
		const newUrl = new URL(url.toString());
		if (newUrl.pathname.endsWith("/rpc")) return newUrl;

		if (!newUrl.pathname.endsWith("/")) newUrl.pathname += "/";
		newUrl.pathname += "rpc";

		return newUrl;
	}
}
