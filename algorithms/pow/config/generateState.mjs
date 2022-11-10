import { distributeNodes } from "../../../drawing/distributeNodes.mjs";

export function generateState(config) {
  const state = {
    selectedElementId: undefined,
    started: new Date(),
    speed: 1,
    nodes: [],
    messages: []
  };
  for (let i = 0; i < config.numberOfClients; i++) {
    state.nodes.push({
      id: "C" + (i+1),
      type: "client",
      running: true,
      connected: true,
      state: "IDLE",
      pos: [50 + i * 60, 50]
    });
  }
  const nodePositions = distributeNodes(config.numberOfNodes, 80);
  for (let i = 0; i < config.numberOfNodes; i++) {
    state.nodes.push({
      id: "N" + (i+1),
      type: "node",
      running: true,
      connected: true,
      state: "IDLE",
      pos: [nodePositions[i][0] + 80, nodePositions[i][1] + 80]
    });
  }
  return state;
}