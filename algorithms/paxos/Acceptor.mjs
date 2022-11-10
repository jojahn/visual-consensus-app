export class Acceptor {
  constructor(id, network) {
    this.id = id;
    this.network = network;
    this.state = {
      greatestN: -1,
      text: "IDLE"
    };
  }

  onPrepare(msg) {
    let lastState = { ...this.state };

    return {
      do: () => {
        if (msg.n <= this.state.greatestN)  {
          this.state.text = "IDLE";
          this.network.sendTo(msg.fromId, {
            clientId: msg.clientId,
            n: this.state.greatestN,
            v: msg.v,
            method: "IGNORED"
          });
          return;
        }
        this.state.greatestN = msg.n;
        this.state.text = "PROMISED";
        this.network.sendTo(msg.fromId, {
          method: "PROMISE",
          clientId: msg.clientId,
          n: msg.n,
          v: msg.v,
        });
      },
      undo: () => {
        this.state = lastState;
      }
    };
  }

  onAccept(msg) {
    let lastState = { ...this.state };

    return {
      do: () => {
        // Ignored
        if (msg.n > this.state.greatestN) {
          this.state.text = "IDLE";
          const response = {
            clientId: msg.clientId,
            n: this.state.greatestN,
            v: msg.v,
            method: "IGNORED"
          }
          // this.network.sendTo(msg.fromId, response);
          return;
        }

        this.state.text = "ACCEPTED";

        this.network.broadcastToType({
          clientId: msg.clientId,
          n: msg.n,
          v: msg.v,
          method: "ACCEPTED"
        }, "node");

        this.state.greatestN = msg.n;
      },
      undo: () => {
        this.state = lastState;
      }
    }
  }
}