import { SimulatedNode } from "../../simulation/SimulatedNode.ts/index.js";

export class Client extends SimulatedNode {
  constructor(id, config, state, network) {
    super(id, config, state, network);
    this.type = "client";
  }

  request(toId, tx) {
    const lastState = this.state.state;
    return {
      do: () => {
        this.state.text = "WAITING";
        this.network.sendTo(toId, {
          command: "REQUEST",
          tx,
          timestamp: new Date().getTime()
        });
        this.updateState();
      },
      undo: () => {
        this.state.text = lastState;
      }
    }
  }

  onAck() {
    const lastState = this.state.text;
    return {
      do: () => {
        this.state.text = "DONE"
      },
      undo: () => {
        this.state.text = lastState;
      }
    }
  }

  onmessage(msg) {
    if (msg.method === "RESPONSE") {
      this.invoke(this.onAck());
    }
  }

  requestRandom(tx) {
    const node = this.network.getRandomNeighborOfType("node");
    this.invoke(this.request(node.id, tx));
  }
}