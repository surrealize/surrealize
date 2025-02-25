import { EventEmitter } from "../emitter.ts";
import { type ConnectionState, ConnectionStatus } from "../engine.ts";
import { ConnectionError } from "../error.ts";
import { parseUint8Array } from "./bytes.ts";

export type WebSocketPoolOptions = {
	url: string | URL;
	size: number;
	protocols: string | string[];

	readyTimeout: number;
	reconnectTimeout: number;

	setupConnection: (connection: WebSocketConnection) => Promise<void> | void;
};

export type WebSocketPoolEvents = {
	connecting: [];
	connected: [];
	disconnected: [{ reason: string; wasClean: boolean }];
	error: [Error];

	"connection:connecting": [WebSocketConnection];
	"connection:connected": [WebSocketConnection];
	"connection:disconnected": [
		WebSocketConnection,
		{ reason: string; wasClean: boolean },
	];
	"connection:error": [Error, WebSocketConnection?];

	message: [Uint8Array, WebSocketConnection];
};

export class WebSocketPool extends EventEmitter<WebSocketPoolEvents> {
	#options: WebSocketPoolOptions;
	#pool: Map<number, WebSocketConnection> = new Map();
	#connected = false;

	#status: ConnectionStatus = ConnectionStatus.DISCONNECTED;

	#lastId: number = 0;

	constructor(options: WebSocketPoolOptions) {
		super();
		this.#options = options;

		this.#registerEvents();
	}

	get status(): ConnectionStatus {
		return this.#status;
	}

	get ready(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.#status === ConnectionStatus.CONNECTED) return resolve();

			const unsubscribe = this.once("connected", () => {
				clearTimeout(timeout);
				resolve();
			});

			const timeout = setTimeout(() => {
				unsubscribe();
				reject(new ConnectionError("Connection timed out"));
			}, this.#options.readyTimeout);
		});
	}

	connect(): void {
		if (this.#connected) return;
		this.#connected = true;

		this.emit("connecting");

		// cleanup pool
		this.#pool.forEach((connection) => {
			connection.socket.close();
			this.#pool.delete(connection.id);
		});

		for (let i = 0; i < this.#options.size; i++) {
			this.#createConnection(i).catch((error) =>
				this.emit(
					"error",
					error instanceof Error
						? error
						: new Error("Unknown error", { cause: error }),
				),
			);
		}
	}

	disconnect() {
		if (!this.#connected) return;
		this.#connected = false;

		this.emit("disconnected", {
			reason: "requested by user",
			wasClean: true,
		});

		for (const [id, connection] of this.#pool.entries()) {
			connection.socket.close();
			this.#pool.delete(id);
		}
	}

	async send(
		data: Uint8Array,
		connection: WebSocketConnection = this.#getNextConnection(),
		preHook?: (connection: WebSocketConnection) => Promise<void> | void,
	): Promise<void> {
		if (preHook) await preHook(connection);
		return connection.send(data);
	}

	hasConnection(id: number): boolean {
		return this.#pool.has(id);
	}

	#getNextConnection(): WebSocketConnection {
		while (this.#pool.size > 0) {
			this.#lastId += 1;
			if (this.#lastId > this.#options.size) this.#lastId = 0;

			const connection = this.#pool.get(this.#lastId);

			if (!connection) continue;
			return connection;
		}

		throw new Error("No connection available");
	}

	async #createConnection(id: number) {
		// skip creation if pool is closed
		if (!this.#connected) return;
		if (this.#pool.has(id)) throw new Error("Connection already exists");

		const connection = new WebSocketConnection(
			id,
			this.#options.url,
			this.#options.protocols,
		);

		this.emit("connection:connecting", connection);

		connection.on("disconnected", (info) => {
			this.#pool.delete(connection.id);
			this.emit("connection:disconnected", connection, info);
		});

		connection.on("error", (error) =>
			this.emit("connection:error", error, connection),
		);

		connection.on("message", (message) =>
			this.emit("message", message, connection),
		);

		await connection.waitNext("connected");
		await this.#options.setupConnection(connection);

		this.#pool.set(connection.id, connection);
		this.emit("connection:connected", connection);
	}

	#registerEvents() {
		// --- connection events ---

		this.on("connection:disconnected", (connection, info) => {
			if (!this.#connected) return;

			// start reconnecting timeout
			setTimeout(
				() => this.#createConnection(connection.id),
				this.#options.reconnectTimeout,
			);

			// if pool is empty, set status to disconnected
			if (this.#status !== ConnectionStatus.DISCONNECTED)
				this.emit("disconnected", info);
		});

		this.on("connection:connected", () => {
			if (!this.#connected) return;

			// if status is not connected, emit connected event
			if (this.#status !== ConnectionStatus.CONNECTED) this.emit("connected");
		});

		// --- pool events ---

		this.on("connecting", () => (this.#status = ConnectionStatus.CONNECTING));
		this.on("connected", () => (this.#status = ConnectionStatus.CONNECTED));
		this.on(
			"disconnected",
			() => (this.#status = ConnectionStatus.DISCONNECTED),
		);
	}
}

export class WebSocketConnection extends EventEmitter<{
	connecting: [];
	connected: [];
	disconnected: [{ reason: string; wasClean: boolean }];
	error: [Error];
	message: [Uint8Array];
}> {
	readonly socket: WebSocket;

	state: ConnectionState = {};

	constructor(
		readonly id: number,
		readonly url: string | URL,
		readonly protocols?: string | string[],
	) {
		super();
		this.socket = new WebSocket(url, protocols);

		this.#registerEvents();
	}

	send(data: Uint8Array): void {
		this.socket.send(data);
	}

	#registerEvents() {
		this.socket.addEventListener("open", () => this.emit("connected"));
		this.socket.addEventListener("close", (event) =>
			this.emit("disconnected", {
				reason: event.reason,
				wasClean: event.wasClean,
			}),
		);
		this.socket.addEventListener("error", (event) =>
			event instanceof ErrorEvent
				? this.emit("error", new Error(event.message, { cause: event.error }))
				: this.emit("error", new Error("Unknown error")),
		);
		this.socket.addEventListener("message", (event) =>
			parseUint8Array(event.data).then((message) =>
				this.emit("message", message),
			),
		);

		this.emit("connecting");
	}
}
