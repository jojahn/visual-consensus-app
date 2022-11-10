import { setupNode as setupPaxosNode } from "./paxos/setupNode.mjs";
import { setupNode as setupPoWNode } from "./pow/setupNode.mjs";

export function setupNode(key, ...args) {
  switch (key) {
  case "paxos":
    return setupPaxosNode(...args);
  case "bitcoin_pow":
    return setupPoWNode(...args);
  default:
    throw "Algorithm not implemented";
  }
}