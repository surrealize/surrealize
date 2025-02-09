export type RpcRequest<
	TMethod extends string = string,
	TParams extends unknown[] | undefined = unknown[] | undefined,
> = {
	method: TMethod;
	params: TParams;
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
