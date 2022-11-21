export class Learner {
  constructor(id, network, config, parentNode) {
    this.network = network;
    this.config = config;
    this.parentNode = parentNode;
    this.id = id;
    this.state = {
      v: null,
      n: null
    };
  }

  onAccepted(msg) {
    const lastValue = this.state.v;
    const lastLog = [...this.parentNode.state.log];
    return {
      do: () => {
        if (msg.v === this.state.v && msg.n === this.state.n) {
          return;
        }
        this.state.v = msg.v;
        this.state.n = msg.n;
        this.parentNode.state.log[msg.n - 1] = msg.v;
        this.network.sendTo(msg.clientId, {
          clientId: msg.clientId,
          n: msg.n,
          v: msg.v,
          method: "RESPONSE"
        });
      },
      undo: () => {
        this.state.v = lastValue;
        this.parentNode.state.log = lastLog;
      }
    }
  }
}