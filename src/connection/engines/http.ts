import {
	AbstractEngine,
	ConnectionStatus,
	type EngineInit,
} from "../engine.ts";
import { ConnectionError, DatabaseError } from "../error.ts";
import type { RpcRequest, RpcResponse, WithId } from "../rpc.ts";
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

		switch (init.auth?.type) {
			case "root":
				this.state.token = "TODO"; // TODO
				break;

			case "namespace":
				this.state.token = "TODO"; // TODO
				break;

			case "database":
				this.state.token = "TODO"; // TODO
				break;
			case "token":
				this.state.token = init.auth.token;
		}

		return this.ready;
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
				// TODO try if this will work but it should
				id: 0,
				method: request.method,
				params: request.params,
			} satisfies WithId<RpcRequest>),
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
