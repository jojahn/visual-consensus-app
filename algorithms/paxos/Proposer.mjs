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
      n: 1
    };
  }

  hasMajority(n, promise = true) {
    const proposal = this.state.proposals.find(p => p.n === n);
    if (!proposal) {
      return;
    }
    const numberOfAcceptors = this.network.getNeighborsOfType("acceptors").length
      || this.network.getNeighborsOfType("node").length;
    // TODO: Use better quorum (majority)?
    return (promise ? proposal.promises : proposal.acceptances).length > Math.ceil(0.5 * numberOfAcceptors);
  }

  onRequest(msg) {
    let lastState = { state: {...this.state}, parentState: { ...this.parentNode.state } };
    return {
      do: () => {
        this.state.isProposer = true;
        this.state.text = "PREPARING";
        this.state.proposals.push({ clientId: msg.fromId, v: msg.v, n: this.state.n, promises: [], acceptances: [] });
        let acceptors = this.network.getNeighborsOfType("acceptor");
        if (!acceptors || acceptors.length === 0) {
          acceptors = this.network.getNeighborsOfType("node");
        }
        this.parentNode.state.greatestN = this.state.n;
        this.network.broadcast({
          clientId: msg.fromId,
          method: "PREPARE",
          n: this.state.n
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
        if (this.hasMajority(msg.n, false)) {
          proposal.acceptances.push(msg.fromId);
          return;
        } else {
          proposal.acceptances.push(msg.fromId);
        }
        if (this.hasMajority(msg.n, false)) { // && proposal.acceptances.length === proposal.promises.length
          this.state.n = this.state.n + 1;
          this.state.proposals.forEach(p => {
            // TODO: Inform learner/other acceptors here or in acceptor!
          });
          this.state.text = "IDLE";
        }
        this.state.isProposer = false;
      },
      undo: () => {
        this.state = lastState;
      }
    }
  }

  onIgnored(msg) {
    const lastState = { ...this.state };
    return {
      do: () => {
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
        this.state.n = msg.n + 1;
        this.state.proposals[proposalIdx].n = this.state.n;

        let acceptors = this.network.getNeighborsOfType("acceptor");
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
        }
      },
      undo: () => {
        this.state = lastState;
      }
    }
  }
}