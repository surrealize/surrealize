import { decodeCbor, encodeCbor } from "./cbor/cbor.ts";
import type { CborDecoder, CborEncoder } from "./cbor/types.ts";
import { EventEmitter } from "./emitter.ts";
import type { RpcRequest, RpcResponse } from "./rpc.ts";
import type { Auth } from "./types.ts";

export type EngineContext = {
	url: URL;

	namespace?: string;
	database?: string;

	auth?: Auth;

	timeout?: number;
};

export type EngineInitializer = (context: EngineContext) => AbstractEngine;

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
	disconnected: [];
	error: [Error];

	[Key: `rpc-${string}`]: [RpcResponse | Error];
	[Key: `live-${string}`]: [any];
};

export abstract class AbstractEngine {
	abstract ready: Promise<void>;
	abstract status: ConnectionStatus;

	emitter: EventEmitter<EmitterEvents>;

	encodeCbor: CborEncoder;
	decodeCbor: CborDecoder;

	constructor() {
		this.emitter = new EventEmitter<EmitterEvents>();

		this.encodeCbor = encodeCbor;
		this.decodeCbor = decodeCbor;
	}

	abstract connect(): Promise<void>;
	abstract disconnect(): Promise<void>;

	abstract rpc<TResult>(request: RpcRequest): Promise<RpcResponse<TResult>>;

	abstract version(): Promise<string>;
}
