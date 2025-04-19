import type { CborCodec } from "../cbor/cbor.ts";
import { AbstractEngine, ConnectionStatus } from "../engine.ts";
import { ConnectionError, DatabaseError } from "../error.ts";
import type { Auth, RpcRequest, RpcResponse, WithId } from "../types.ts";
import { Jwt } from "../utils/jwt.ts";
import { handleRpcResponse } from "../utils/rpc.ts";

export type HttpEngineOptions = {
  namespace?: string;
  database?: string;
  auth?: Auth;

  /**
   * Custom headers to send with every request.
   */
  headers?: HeadersInit;

  cbor?: CborCodec;
};

export class HttpEngine extends AbstractEngine {
  url: URL;

  #options: HttpEngineOptions;

  constructor(url: URL | string, options: HttpEngineOptions = {}) {
    super({
      cbor: options.cbor,
      namespace: options.namespace,
      database: options.database,
      auth: options.auth,
    });

    this.#options = options;
    this.url = this.#parseUrl(url);
  }

  getStatus(): ConnectionStatus {
    return ConnectionStatus.CONNECTED;
  }

  async isReady(): Promise<void> {
    await this.#checkToken();
  }

  async connect(): Promise<void> {
    return this.isReady();
  }

  async disconnect(): Promise<void> {}

  async rpc<TResult>(request: RpcRequest): Promise<RpcResponse<TResult>> {
    await this.isReady();

    const response = await this.#rawRpc(request);

    handleRpcResponse(this, response as WithId<RpcResponse> | RpcResponse);

    return response as RpcResponse<TResult>;
  }

  async #rawRpc<TResult>(request: RpcRequest): Promise<RpcResponse<TResult>> {
    const httpResponse = await fetch(this.url, {
      method: "POST",
      headers: this.#createHeaders(),
      body: this.cbor.encode({
        method: request.method,
        params: request.params,
      } satisfies RpcRequest),
    });

    if (!httpResponse.ok)
      throw new ConnectionError(
        `HTTP error: ${httpResponse.status}`,
        httpResponse,
      );

    const response = await httpResponse
      .arrayBuffer()
      .then((buffer) => this.cbor.decode(new Uint8Array(buffer)));

    if (
      !(
        typeof response === "object" &&
        response !== null &&
        Object.getPrototypeOf(response) === Object.prototype
      )
    )
      throw new ConnectionError("Unexpected response", httpResponse);

    return response as RpcResponse<TResult>;
  }

  async version(): Promise<string> {
    const request: RpcRequest = { method: "version", params: [] };
    const response = await this.rpc<string>({ method: "version", params: [] });
    if (response.error) throw new DatabaseError(response.error, request);
    return response.result;
  }

  async #checkToken(): Promise<void> {
    const auth = this.options.auth;

    // skip if no auth provided
    if (!auth) return;

    const jwt = this.state.token ? new Jwt(this.state.token) : undefined;

    // if token is valid, do nothing
    if (jwt?.isValid()) return;

    if (auth.type === "token") {
      this.state.token = auth.token;
      return;
    }

    const payload: {
      user: string;
      pass: string;
      NS?: string;
      DB?: string;
    } = {
      user: auth.username,
      pass: auth.password,
    };

    if ("namespace" in auth) {
      payload.NS = auth.namespace;

      if ("database" in auth) {
        payload.DB = auth.database;
      }
    }

    const request: RpcRequest = { method: "signin", params: [payload] };

    const response = await this.#rawRpc<string>({
      method: "signin",
      params: [payload],
    });

    if (response.error) throw new DatabaseError(response.error, request);

    this.state.token = response.result;
  }

  #createHeaders(): Headers {
    const headers = new Headers(this.#options.headers);
    headers.set("Content-Type", "application/cbor");
    headers.set("Accept", "application/cbor");

    if (this.#options.namespace) {
      headers.set("Surreal-NS", this.#options.namespace);

      if (this.#options.database) {
        headers.set("Surreal-DB", this.#options.database);
      }
    }

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
