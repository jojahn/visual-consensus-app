import { Network } from "./Network";
import { randomId } from "../config/randomId.mjs";
import { SimulatedNode } from "./SimulatedNode";
import { setupNode } from "../algorithms/setupNode.mjs";
import { ClientRequestor } from "./ClientRequestor";

export class NodeRunner<T extends SimulatedNode & Partial<ClientRequestor>> {
  private stopListening: () => void;
  private messageEventHandler: (event: any) => void;

  private readonly id: string;
  private config: any;
  private network: Network;
  private nodeStates: any[];
  private nodes: T[];

  constructor(config, nodeStates) {
    this.id = randomId();
    this.config = config;
    this.network = null;
    this.nodeStates = nodeStates;
    this.nodes = [];
  }

  terminate() {
    this.stopListening && this.stopListening();
  }

  buildMessageEventHandler() {
    return (event) => {
      const msg = event.data;
      console.log(`NodeRunner for "${this.nodeStates
        ? this.nodeStates.map(n => n.id).join(", ") : "?"}" got:`, msg);
      if (msg.isFlow) {
        this.onFlowMessage(msg);
        return;
      }
      if (msg.toId) {
        const node = this.nodes.find(n => n.id === msg.toId);
        if (node && node.running && node.connected) {
          node.onmessage(msg);
        }
      }
    }
  }

  setupNetwork = (node, neighbors) => new Network(node, neighbors);

  setupNodes(config, nodeStates, neighbors) {
    this.nodeStates = nodeStates;
    nodeStates.forEach(async n => {
      const net = this.setupNetwork(n, neighbors);
      const node = setupNode(config.algorithm, config, null, n, net);
      if (node) {
        node.updateState();
        this.nodes.push(node);
        console.log("Starting node with id ",
          node.id,
          "and type",
          node.type);
      }
    });
  }

  onFlowMessage(msg) {
    const { nodeId } = msg;
    switch(msg.type) {
    case "CLIENT_REQUEST":
      if (nodeId) {
        const node = this.nodes.find(n => n.id === nodeId);
        if (node && node.type === "client") {
          const { v } = msg;
          (node as ClientRequestor).requestRandom(v);
        }
      }
      break;
    case "SETUP": case "RESET":
      // TODO: only reset the given node if specified
      this.setupNodes(msg.config, msg.nodes, msg.neighbors);
      this.postMessageToMain({
        isFlow: true,
        type: "STATE_CHANGED",
        state: "IDLE"
      });
      break;

    case "STEP":
      // TODO: only undo last done command
      this.nodes.forEach(n => n.step(msg.forward));
      break;

    case "DISCONNECT": case "RECONNECT": case "STOP": case "RESTART":
      if (nodeId) {
        const node = this.nodes.find(n => n.id === nodeId);
        if (node) {
          if (msg.type === "RECONNECT") node.reconnect();
          else if (msg.type === "DISCONNECT") node.disconnect();
          else if (msg.type === "RESTART") node.restart();
          else if (msg.type === "STOP") {
            this.postMessageToMain({
              isFlow: true,
              type: "COMMANDS",
              commands: node.executedCommands
            })
            node.stop();
          }
        }
      }
      break;
    default:
      console.error("Flow message type not recognized");
      break;
    }
  }

  // Emulation of WebWorker functionality 
  onmessage() { console.warn("onmessage is not implemented"); }
  onerror() { console.warn("onerror is not implemented"); }
  // One-way function
  postMessage(msg) {
    if (!this.messageEventHandler) {
      this.messageEventHandler = this.buildMessageEventHandler();
    }
    const event = { data: msg };
    this.messageEventHandler(event);
  }

  postMessageToMain(msg) {
    window.dispatchEvent(new CustomEvent("NodeRunnerEvent", { detail: { ...msg, nodeRunnerId: this.id } }));
  }

  startListening() {
    const isRelevant = event => event.detail.nodeRunnerId === this.id || this.nodeStates.filter(
      n => n.id === event.detail.nodeId || n.id === event.detail.toId
    ).length !== 0;

    const enrichCallback = (cb) => event => isRelevant(event) && cb({ data: event.detail });
    const wrappedCallback = enrichCallback(this.onmessage);
    window.addEventListener("NodeRunnerEvent", wrappedCallback);
    window.addEventListener("NetworkEvent", wrappedCallback);
    this.stopListening = () => {
      window.removeEventListener("NodeRunnerEvent", wrappedCallback);
      window.removeEventListener("NetworkEvent", wrappedCallback);
    }
  }
}
