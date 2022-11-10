import { Client } from "./Client.mjs";
import { PaxosNode } from "./PaxosNode.mjs";

export function setupNode(config, state, nodeState, network) {
  if (nodeState.type === "client") {
    return new Client(
      nodeState.id,
      config,
      nodeState,
      network);
  } else {
    return new PaxosNode(
      nodeState.id,
      config,
      nodeState,
      network,
      nodeState.type || "all"
    );
  }
}