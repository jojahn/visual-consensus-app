export class Learner {
  constructor(id, network) {
    this.network = network;
    this.id = id;
    this.state = {
      v: null,
      n: null,
      log: []
    };
  }

  onAccepted(msg) {
    const lastValue = this.state.v;
    return {
      do: () => {
        if (msg.v === this.state.v && msg.n === this.state.n) {
          return;
        }
        this.state.v = msg.v;
        this.state.n = msg.n;
        this.state.log[msg.n - 1] = msg.v;
        this.network.sendTo(msg.clientId, {
          clientId: msg.clientId,
          n: msg.n,
          v: msg.v,
          method: "RESPONSE"
        });
      },
      undo: () => {
        this.state.v = lastValue;
      }
    }
  }
}