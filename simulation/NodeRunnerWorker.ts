import { WorkerNetwork } from "./WorkerNetwork.js";
import { NodeRunner } from "./NodeRunner";

export default class NodeRunnerWorker extends NodeRunner {
  constructor() {
    super();
    self.onmessage = this.buildMessageEventHandler();
    this.postMessage = () => import.meta.env.DEV && console.warn("Call postMessage on actual worker instead");
    this.postMessageToMain = (msg) => self.postMessage(msg);
  }

  setupNetwork = (node, neighbors) => new WorkerNetwork(node, neighbors);
}

self.runner = new NodeRunnerWorker();
