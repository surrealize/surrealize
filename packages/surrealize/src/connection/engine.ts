import { decodeCbor, encodeCbor } from "./cbor/cbor.ts";
import type { CborDecoder, CborEncoder } from "./cbor/types.ts";
import type { ConnectionContext } from "./connection.ts";
import { EventEmitter } from "./emitter.ts";
import type { RpcRequest, RpcResponse } from "./rpc.ts";

export type EngineInitializer = (context: ConnectionContext) => AbstractEngine;

export enum ConnectionStatus {
	CONNECTING = 0,
	CONNECTED = 1,
	DISCONNECTING = 2,
	DISCONNECTED = 3,
	ERROR = 4,
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
