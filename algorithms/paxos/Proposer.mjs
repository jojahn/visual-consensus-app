export class Proposer {
  constructor(id, network, config, parentNode) {
    this.id = id;
    this.config = config;
    this.parentNode = parentNode;
    this.network = network;
    this.type = "proposer";
    this.state = {
      proposals: [],
      text: "IDLE",
    };
  }

  hasMajority(n, propertyName = "promises") {
    const proposal = this.state.proposals.find(p => p.n === n);
    if (!proposal) {
      return;
    }
    const numberOfAcceptors = this.network.getNeighborsOfType("acceptors").length
      || this.network.getNeighborsOfType("node").length;
    return proposal[propertyName].length >= Math.floor(0.5 * numberOfAcceptors) + 1;
  }

  onRequest(msg) {
    let lastState = { state: {...this.state}, parentState: { ...this.parentNode.state } };
    return {
      do: () => {
        this.state.isProposer = true;
        this.state.text = "PREPARING";
        this.parentNode.state.greatestN += 1;
        this.state.proposals.push({
          clientId: msg.fromId,
          v: msg.v,
          n: this.parentNode.state.greatestN,
          promises: [],
          acceptances: [],
          ignoredBy: []
        });
        let acceptors = this.network.getNeighborsOfType("acceptor");
        if (!acceptors || acceptors.length === 0) {
          acceptors = this.network.getNeighborsOfType("node");
        }
        this.parentNode.state.log[this.parentNode.state.greatestN - 1] = msg.v;
        this.network.broadcast({
          clientId: msg.fromId,
          method: "PREPARE",
          n: this.parentNode.state.greatestN
        }, acceptors.map(a => a.id));
      },
      undo: () => {
        this.state = lastState.state;
        this.parentNode.state = lastState.parentState;
      }
    };
  }

  onPromise(msg) {
    const lastState = { ...this.state };
    return {
      do: () => {
        // TODO: Check if promise fits stored promises. CORRECTNESS!!!
        const proposal = this.state.proposals.find(p => p.n === msg.n);
        if (!proposal) {
          return;
        }
        if (this.hasMajority(msg.n)) {
          proposal.promises.push(msg.fromId);
          return;
        } else {
          proposal.promises.push(msg.fromId);
        }
        /* let acceptors = this.network.getNeighborsOfType("acceptor");
        if (!acceptors || acceptors.length === 0) {
          acceptors = this.network.getNeighborsOfType("node");
        } */
        if (this.hasMajority(msg.n)) { // && acceptors.length === proposal.promises.length
          this.network.broadcastToType({
            clientId: msg.clientId,
            method: "ACCEPT",
            n: proposal.n,
            v: proposal.v
          }, "node");
          this.state.text = "PROMISED";
        }
      },
      undo: () => {
        this.state = lastState;
      }
    }
  }

  onAccepted(msg) {
    const lastState = { ...this.state };
    return {
      do: () => {
        const proposal = this.state.proposals.find(p => p.n === msg.n);
        if (!proposal) {
          return;
        }
        if (this.hasMajority(msg.n, "acceptances")) {
          proposal.acceptances.push(msg.fromId);
          return;
        } else {
          proposal.acceptances.push(msg.fromId);
        }
        if (this.hasMajority(msg.n, "acceptances")) { // && proposal.acceptances.length === proposal.promises.length
          this.state.proposals.forEach(p => {
            // TODO: Inform learner/other acceptors here or in acceptor!
          });
          this.state.text = "IDLE";
        }
        this.state.isProposer = false;
      },
      undo: () => {
        this.state = lastState.state;
        this.parentNode.state = lastState.parentState;
      }
    }
  }

  onIgnored(msg) {
    let lastState = { state: {...this.state}, parentState: { ...this.parentNode.state } };
    return {
      do: () => {
        // the generation of message is not the current generation of the proposer
        if (msg.n > this.parentNode.state.greatestN) {
          this.parentNode.state.greatestN = msg.n;
          this.state.isProposer = false;
          return;
        } else if (msg.n < this.parentNode.state.greatestN) {
          return;
        }
        const proposalIdx = this.state.proposals.findIndex(p => p.n === msg.n);
        if (proposalIdx < 0 || !this.state.proposals[proposalIdx]) {
            return;
        }

        this.state.proposals = this.state.proposals.map(p => p.n === msg.n
          ? {
            ...p,
            acceptances: p.acceptances.filter(p => p.acceptorId !== msg.fromId),
            promises: p.promises.filter(p => p.acceptorId !== msg.fromId)
          } : p);

        // this.state.n = msg.n + 1;
        // this.state.proposals[proposalIdx].n = this.state.n;

        // TODO: decide how to handle ignored messages
        // Retry prepare with higher number
        /* let acceptors = this.network.getNeighborsOfType("acceptor");
        if (!acceptors || acceptors.length === 0) {
          acceptors = this.network.getNeighborsOfType("node");
        }
        for (let a of acceptors) {
          this.network.sendTo(a.id, {
            clientId: this.state.proposals[proposalIdx].clientId,
            v: this.state.proposals[proposalIdx].v,
            method: "PREPARE",
            n: this.state.n
          });
        } */
      },
      undo: () => {
        this.state = lastState;
      }
    }
  }
}