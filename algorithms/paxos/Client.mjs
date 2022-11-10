import { SimulatedNode } from "../../simulation/SimulatedNode";

export class Client extends SimulatedNode {
  constructor(id, config, state, network) {
    super(id, config, state, network);
    this.type = "client";
  }

  request(toId, v) {
    const lastState = this.state.state;
    return {
      do: () => {
        this.state.text = "WAITING";
        this.network.sendTo(toId, {
          method: "REQUEST",
          v
        });
        this.updateState();
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

  requestRandom(value) {
    const node = this.network.getRandomNeighborOfType("proposer")
      || this.network.getRandomNeighborOfType("node");
    this.invoke(this.request(node.id, value));
  }
}
