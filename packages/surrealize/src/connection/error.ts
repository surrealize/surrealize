import type { RpcResponseError } from "./rpc.ts";

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
