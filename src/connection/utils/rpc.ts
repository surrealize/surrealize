import type { AbstractEngine } from "../engine.ts";
import type { RpcResponse, WithId } from "../rpc.ts";

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
