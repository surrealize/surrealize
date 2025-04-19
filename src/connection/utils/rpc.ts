import type { AbstractEngine } from "../engine.ts";
import type { RpcResponse, WithId } from "../types.ts";

export const handleRpcResponse = (
  engine: AbstractEngine,
  response: WithId<RpcResponse> | RpcResponse,
): void => {
  if ("id" in response) {
    engine.emit(`rpc-${response.id}`, response);
  } else {
    // TODO live query
    // TODO handle error
  }
};
