import { distributeNodes } from "../../../drawing/distributeNodes.mjs";

const MIN_CLIENTS = 1;
const MIN_NODES = 1;
const MIN_PROPOSERS = 1;
const MIN_ACCEPTORS = 1;
const MIN_LEARNERS = 1;

export function generateState(config) {
  const state = {
    selectedElementId: undefined,
    started: new Date(),
    speed: 1,
    nodes: [],
    messages: []
  };

  state.nodes = createNodes(config);

  return state;
}

function createNodes(config) {
  const nodes = [];
  if (config.numberOfClients < MIN_CLIENTS) throw "IllegalAmountOfClients";
  for (let i = 0; i < config.numberOfClients; i++) {
    nodes.push({
      id: "C" + (i+1),
      type: "client",
      running: true,
      connected: true,
      state: "IDLE",
      pos: [50 + i * 60, 50]
    });
  }

  if (config.useSingleNodes) {
    if (config.numberOfNodes < MIN_NODES) throw "IllegalAmountOfNodes";
    const offsetFromClient = 130; // 50 (client offset) + 50 (client size) + 30 (padding)
    const nodePositions = distributeNodes(config.numberOfNodes, 100);
    for (let i = 0; i < config.numberOfNodes; i++) {
      nodes.push({
        id: "N" + (i+1),
        type: "node",
        running: true,
        connected: true,
        state: "IDLE",
        pos: [nodePositions[i][0] + 50, nodePositions[i][1] + offsetFromClient]

      });
    }
    return nodes;
  }
  if (config.numberOfProposers < MIN_PROPOSERS) throw "IllegalAmountOfProposers";
  for (let i = 0; i < config.numberOfProposers; i++) {
    nodes.push({
      id: "P" + (i + 1),
      type: "proposer",
      state: "IDLE",
      running: true,
      connected: true,
      pos: [100 + i * 60, 150]
    });
  }
  if (config.numberOfAcceptors < MIN_ACCEPTORS) throw "IllegalAmountOfAcceptors";
  for (let i = 0; i < config.numberOfAcceptors; i++) {
    nodes.push({
      id: "A" + (i+1),
      type: "acceptor",
      state: "IDLE",
      running: true,
      connected: true,
      pos: [100 + i * 60, 250]
    });
  }
  if (config.numberOfLearners < MIN_LEARNERS) throw "IllegalAmountOfLearners";
  for (let i = 0; i < config.numberOfLearners; i++) {
    nodes.push({
      id: "L" + (i+1),
      type: "learner",
      state: "IDLE",
      running: true,
      connected: true,
      pos: [50 + i * 60, 350]
    });
  }
  return nodes;
}