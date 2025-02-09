export class DatabaseError extends Error {
	code: number;

	constructor(code: number, message: string) {
		super(message);
		this.code = code;
	}
}

export class QueryError extends Error {
	constructor(message: string) {
		super(message);
	}
}
