export class Acceptor {
  constructor(id, network, config, parentNode) {
    this.id = id;
    this.config = config;
    this.parentNode = parentNode;
    this.network = network;
    this.state = {
      greatestN: -1,
      text: "IDLE"
    };
  }

  onPrepare(msg) {
    let lastState = { state: {...this.state}, parentState: { ...this.parentNode.state } };

    return {
      do: () => {
        if (msg.n <= this.parentNode.state.greatestN)  {
          this.state.text = "IDLE";
          this.network.sendTo(msg.fromId, {
            clientId: msg.clientId,
            n: this.parentNode.state.greatestN,
            method: "IGNORED"
          });
          return;
        }
        this.parentNode.state.greatestN = msg.n;
        this.state.text = "PROMISED";
        this.network.sendTo(msg.fromId, {
          method: "PROMISE",
          clientId: msg.clientId,
          n: msg.n,
        });
      },
      undo: () => {
        this.state = lastState;
        this.parentNode.state = lastState.parentState;
      }
    };
  }

  onAccept(msg) {
    let lastState = { state: {...this.state}, parentState: { ...this.parentNode.state } };

    return {
      do: () => {
        // Ignored
        if (msg.n > this.parentNode.state.greatestN) {
          this.state.text = "IDLE";
          const response = {
            clientId: msg.clientId,
            n: this.parentNode.state.greatestN,
            v: msg.v,
            method: "IGNORED"
          }
          this.network.sendTo(msg.fromId, response);
          return;
        }

        this.state.text = "ACCEPTED";

        if (this.config.learnerImpl === "contactAllAcceptors") {
          this.network.broadcastToType({
            clientId: msg.clientId,
            n: msg.n,
            v: msg.v,
            method: "ACCEPTED"
          }, "node");
        } else {
          this.network.sendTo(msg.fromId, {
            clientId: msg.clientId,
            n: msg.n,
            v: msg.v,
            method: "ACCEPTED"
          });
          this.parentNode.state.log[msg.n - 1] = msg.v;
        }

        this.parentNode.state.greatestN = msg.n;
      },
      undo: () => {
        this.state = lastState.state;
        this.parentNode.state = lastState.parentState;
      }
    }
  }
}