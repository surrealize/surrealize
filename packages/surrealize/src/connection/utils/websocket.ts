import { EventEmitter } from "../emitter.ts";
import { ConnectionStatus } from "../engine.ts";
import { parseUint8Array } from "./incremental_number.ts";

export type WebSocketOptions = {
	protocols?: string | string[];

	timeout?: number;
	reconnectTimeout?: number;
};

type WebSocketEvents = {
	connecting: [];
	connected: [];
	disconnecting: [];
	disconnected: [];
	error: [Error];
	message: [Uint8Array];
};

export class ManagedWebSocket extends EventEmitter<WebSocketEvents> {
	#socket: WebSocket | null = null;

	#url: URL;
	#options: WebSocketOptions;

	#closed: boolean = true;
	#waitReconnect: boolean = false;

	constructor(url: URL, options: WebSocketOptions = {}) {
		super();

		this.#url = url;
		this.#options = options;

		this.on("disconnected", () => this.#handleReconnect());
	}

	get status(): ConnectionStatus {
		if (this.#waitReconnect) return ConnectionStatus.CONNECTING;
		if (!this.#socket) return ConnectionStatus.DISCONNECTED;

		switch (this.#socket.readyState) {
			case WebSocket.CONNECTING:
				return ConnectionStatus.CONNECTING;
			case WebSocket.OPEN:
				return ConnectionStatus.CONNECTED;
			case WebSocket.CLOSING:
				return ConnectionStatus.DISCONNECTING;
			case WebSocket.CLOSED:
				return ConnectionStatus.DISCONNECTED;
		}

		throw new Error(
			"Unknown WebSocket ready state: " + this.#socket.readyState,
		);
	}

	get ready(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.#closed) return reject(new Error("Socket is closed"));

			const unsub = this.once("connected", () => {
				clearTimeout(timeout);
				resolve();
			});

			// TODO better timeout handling ( -> global)
			// maybe move ready to a global promise?
			const timeout = this.#options.timeout
				? setTimeout(() => {
						unsub();
						reject(new Error("Connection timeout"));
					}, this.#options.timeout)
				: undefined;

			if (this.status === ConnectionStatus.CONNECTED) {
				unsub();
				clearTimeout(timeout);
				resolve();
			}
		});
	}

	async connect(): Promise<void> {
		if (this.#socket) throw new Error("There is already a socket");

		this.#closed = false;
		this.#waitReconnect = false;
		this.emit("connecting");
		this.#socket = new WebSocket(this.#url, this.#options.protocols);

		this.#registerListeners();

		return this.ready;
	}

	disconnect(): void {
		this.#waitReconnect = false;
		this.#closed = true;

		if (!this.#socket) return;

		if (
			this.#socket.readyState !== WebSocket.CLOSED &&
			this.#socket.readyState !== WebSocket.CLOSING
		) {
			this.emit("disconnecting");
			this.#socket.close();
		}

		this.#socket = null;
	}

	async send(data: Uint8Array): Promise<void> {
		if (!this.#socket) throw new Error("Not connected");
		await this.ready;
		this.#socket.send(data);
	}

	#registerListeners() {
		if (!this.#socket) return;

		this.#socket.addEventListener("open", () => this.emit("connected"));

		this.#socket.addEventListener("close", () => this.emit("disconnected"));

		this.#socket.addEventListener("error", (event) =>
			event instanceof ErrorEvent
				? this.emit("error", new Error(event.message, { cause: event.error }))
				: this.emit("error", new Error("Unknown error")),
		);

		this.#socket.addEventListener("message", (e) =>
			parseUint8Array(e.data).then((message) => this.emit("message", message)),
		);
	}

	#handleReconnect(): void {
		// if socket is closed by purpose, don't reconnect
		if (this.#closed) return;

		this.#socket?.close();
		this.#socket = null;

		this.#waitReconnect = true;

		setTimeout(() => {
			if (this.#closed) return;
			this.connect();
		}, this.#options.reconnectTimeout ?? 1000);
	}
}
