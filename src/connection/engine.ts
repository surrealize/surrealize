import type { CborCodec } from "./cbor/cbor.ts";
import { DefaultCborCodec } from "./cbor/default.ts";
import { EventEmitter } from "./emitter.ts";
import type { RpcRequest, RpcResponse, WithId } from "./rpc.ts";
import type { Auth } from "./types.ts";

export type EngineOptions = {
	namespace?: string;
	database?: string;
	auth?: Auth;

	cbor?: CborCodec;
};

export type ConnectionState = {
	token?: string;
	// variables?: Record<string, unknown>;
};

export enum ConnectionStatus {
	CONNECTING = "CONNECTING",
	CONNECTED = "CONNECTED",
	DISCONNECTING = "DISCONNECTING",
	DISCONNECTED = "DISCONNECTED",
	ERROR = "ERROR",
}

export type EmitterEvents = {
	connecting: [];
	connected: [];
	disconnecting: [];
	disconnected: [error?: Error];
	error: [error: Error];

	[Key: `rpc-${string}`]: [WithId<RpcResponse>];
	[Key: `live-${string}`]: [any];
};

export abstract class AbstractEngine extends EventEmitter<EmitterEvents> {
	cbor: CborCodec;
	options: EngineOptions;
	state: ConnectionState;

	constructor(options?: EngineOptions) {
		super();
		this.options = options ?? {};
		this.cbor = options?.cbor ?? new DefaultCborCodec();
		this.state = {};
	}

	abstract isReady(): Promise<void>;
	abstract getStatus(): ConnectionStatus;

	abstract connect(): Promise<void>;
	abstract disconnect(): Promise<void>;

	abstract rpc<TResult>(request: RpcRequest): Promise<RpcResponse<TResult>>;

	abstract version(): Promise<string>;
}
