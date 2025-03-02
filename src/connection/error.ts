import type { RpcRequest, RpcResponseError } from "./types.ts";

export class DatabaseError extends Error {
	code: number;
	request: RpcRequest;

	constructor(
		{ code, message }: RpcResponseError["error"],
		request: RpcRequest,
	) {
		super(message);
		this.code = code;
		this.request = request;
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
