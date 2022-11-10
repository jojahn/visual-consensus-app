import { Client } from "./Client.mjs";
import { Node } from "./Node.mjs";

export function setupNode(config, state, nodeState, network) {
  switch(nodeState.type) {
  case "client":
    return new Client(nodeState.id, config, nodeState, network);
  case "node":
    return new Node(nodeState.id, config, nodeState, network);
  }
}