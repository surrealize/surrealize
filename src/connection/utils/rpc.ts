import type { AbstractEngine, EngineState } from "../engine.ts";
import type { RpcRequest, RpcResponse, WithId } from "../rpc.ts";

export const handleRpcResponse = (
	engine: AbstractEngine,
	response: WithId<RpcResponse> | RpcResponse,
): void => {
	if ("id" in response) {
		engine.emit(`rpc-${response.id}`, response);
	} else if (false /* is live query */) {
		// TODO live query
	} else {
		// TODO handle error
	}
};

export const handleRpcRequest = (
	state: EngineState,
	request: RpcRequest,
	response: RpcResponse,
): void => {
	if (response.error) return;

	switch (request.method) {
		case "use": {
			const [namespace, database] = request.params as [
				string | null | undefined,
				string | null | undefined,
			];

			if (namespace === null) state.namespace = undefined;
			if (database === null) state.database = undefined;
			if (namespace) state.namespace = namespace;
			if (database) state.database = database;
			break;
		}

		case "signin":
		case "signup": {
			state.token = response.result as string;
			break;
		}

		case "authenticate": {
			const [token] = request.params as [string];
			state.token = token;
			break;
		}

		case "invalidate": {
			state.token = undefined;
			break;
		}

		case "let": {
			// TODO
		}

		case "unset": {
			// TODO
		}
	}
};
