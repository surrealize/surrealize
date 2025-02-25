export type Auth =
	| { type: "root"; username: string; password: string }
	| {
			type: "database";

			namespace: string;
			database: string;

			username: string;
			password: string;
	  }
	| {
			type: "namespace";

			namespace: string;

			username: string;
			password: string;
	  }
	| { type: "token"; token: string };

export type RpcRequest<
	TMethod extends string = string,
	TParams extends unknown[] | undefined = unknown[] | undefined,
> = {
	method: TMethod;
	params: TParams;

	version?: number;
};

export type RpcResponse<TResult = unknown> =
	| RpcResponseOk<TResult>
	| RpcResponseError;

export type RpcResponseOk<TResult = unknown> = {
	result: TResult;
	error?: undefined;
};

export type RpcResponseError = {
	result?: undefined;
	error: {
		code: number;
		message: string;
	};
};

export type WithId<T extends RpcRequest | RpcResponse> = T & {
	id: number;
};
