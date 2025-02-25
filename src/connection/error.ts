import type { RpcResponseError } from "./types.ts";

export class DatabaseError extends Error {
	code: number;

	constructor({ code, message }: RpcResponseError["error"]) {
		super(message);
		this.code = code;
	}
}

export class QueryError extends Error {
	constructor(message: string) {
		super(message);
	}
}

export class ConnectionError<T = unknown> extends Error {
	details?: T;

	constructor(message: string, details?: T) {
		super(message);
		this.details = details;
	}
}
