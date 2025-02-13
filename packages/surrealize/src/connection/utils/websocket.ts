import { EventEmitter } from "../emitter.ts";
import { parseUint8Array } from "./incremental_number.ts";

export enum WebSocketStatus {
	CONNECTING = 0,
	CONNECTED = 1,
	DISCONNECTING = 2,
	DISCONNECTED = 3,
}

export type WebSocketOptions = {
	protocols?: string | string[];
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
	#retries: number = 0;

	constructor(url: URL, options: WebSocketOptions = {}) {
		super();

		this.#url = url;
		this.#options = options;

		this.on("disconnected", () => this.#handleReconnect());
	}

	get status(): WebSocketStatus {
		if (!this.#socket) return WebSocketStatus.DISCONNECTED;

		switch (this.#socket.readyState) {
			case WebSocket.CONNECTING:
				return WebSocketStatus.CONNECTING;
			case WebSocket.OPEN:
				return WebSocketStatus.CONNECTED;
			case WebSocket.CLOSING:
				return WebSocketStatus.DISCONNECTING;
			case WebSocket.CLOSED:
				return WebSocketStatus.DISCONNECTED;
		}

		throw new Error(
			"Unknown WebSocket ready state: " + this.#socket.readyState,
		);
	}

	get ready(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.#closed) return reject(new Error("Socket is closed"));
			if (this.status === WebSocketStatus.CONNECTED) return resolve();

			let fulfilled = false;

			const unsub = this.once("connected", () => {
				if (fulfilled) return;
				fulfilled = true;
				resolve();
				clearTimeout(timeout);
			});

			const timeout = setTimeout(() => {
				if (fulfilled) return;
				fulfilled = true;
				reject(new Error("Timeout"));
				unsub();
			});
		});
	}

	connect(): Promise<void> {
		if (this.#socket)
			return Promise.reject(new Error("There is already a socket"));

		this.#closed = false;
		this.emit("connecting");
		this.#socket = new WebSocket(this.#url, this.#options.protocols);

		this.#registerListeners();

		return this.ready;
	}

	disconnect(): void {
		if (!this.#socket) return;

		this.#closed = true;

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
				? this.emit("error", event.error)
				: this.emit("error", new Error("Unknown error")),
		);

		this.#socket.addEventListener("message", (e) =>
			parseUint8Array(e.data).then((message) => this.emit("message", message)),
		);
	}

	#handleReconnect(): void {
		// if socket is closed by purpose, don't reconnect
		if (this.#closed) return;

		this.disconnect();

		setTimeout(() => {
			this.connect();
			this.#retries++;
		}, 1000);
	}
}
