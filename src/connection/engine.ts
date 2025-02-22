import { decodeCbor, encodeCbor } from "./cbor/cbor.ts";
import type { CborDecoder, CborEncoder } from "./cbor/types.ts";
import { EventEmitter } from "./emitter.ts";
import type { RpcRequest, RpcResponse, WithId } from "./rpc.ts";
import type { Auth } from "./types.ts";

export type EngineInit = {
	namespace?: string;
	database?: string;

	auth?: Auth;
};

export type EngineState = {
	namespace?: string;
	database?: string;
	token?: string;
	variables?: Record<string, unknown>;
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
	abstract ready: Promise<void>;
	abstract status: ConnectionStatus;

	state: EngineState = {};

	encodeCbor: CborEncoder;
	decodeCbor: CborDecoder;

	constructor() {
		super();

		this.encodeCbor = encodeCbor;
		this.decodeCbor = decodeCbor;
	}

	abstract connect(init: EngineInit): Promise<void>;
	abstract disconnect(): Promise<void>;

	abstract rpc<TResult>(request: RpcRequest): Promise<RpcResponse<TResult>>;

	abstract version(): Promise<string>;
}
