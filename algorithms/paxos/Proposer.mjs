export class Proposer {
  constructor(id, network) {
    this.id = id;
    this.network = network;
    this.type = "proposer";
    this.state = {
      proposals: [],
      text: "IDLE",
      n: 1
    }
  }

  hasMajority(n, promise = true) {
    const proposal = this.state.proposals.find(p => p.n === n);
    if (!proposal) {
      console.log("----> no proposal", this.state.proposals)
      return;
    }
    const numberOfAcceptors = this.network.getNeighborsOfType("acceptors").length
      || (this.network.getNeighborsOfType("node").length - 1);
    // TODO: Use better quorum (majority)?
    return (promise ? proposal.promises : proposal.acceptances).length > Math.round(0.5 * numberOfAcceptors);
  }

  onRequest(msg) {
    const lastState = { ...this.state };
    return {
      do: () => {
        this.state.isProposer = true;
        this.state.text = "PREPARING";
        this.state.proposals.push({ clientId: msg.fromId, v: msg.v, n: this.state.n, promises: [], acceptances: [] });
        let acceptors = this.network.getNeighborsOfType("acceptor");
        if (!acceptors || acceptors.length === 0) {
          acceptors = this.network.getNeighborsOfType("node");
        }
        this.network.broadcast({
          clientId: msg.fromId,
          v: msg.v,
          method: "PREPARE",
          n: this.state.n
        }, acceptors.map(a => a.id));
      },
      undo: () => {
        this.state = lastState;
      }
    };
  }

  onPromise(msg) {
    const lastState = { ...this.state };
    return {
      do: () => {
        if (this.state.text === "PROMISED") {
          return;
        }
        // TODO: Check if promise fits stored promises. CORRECTNESS!!!
        const proposal = this.state.proposals.find(p => p.n === msg.n);
        if (!proposal) {
          return;
        }
        proposal.promises.push(msg.fromId);
        /* let acceptors = this.network.getNeighborsOfType("acceptor");
        if (!acceptors || acceptors.length === 0) {
          acceptors = this.network.getNeighborsOfType("node");
        } */
        if (this.hasMajority(msg.n)) { // && acceptors.length === proposal.promises.length
          this.network.broadcast({
            clientId: msg.clientId,
            v: msg.v,
            method: "ACCEPT",
            n: proposal.n
          }, proposal.promises);
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
        if (this.state.text === "IDLE") {
          return;
        }
        const proposal = this.state.proposals.find(p => p.n === msg.n);
        if (!proposal) {
          return;
        }
        proposal.acceptances.push(msg.fromId);
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
          console.log("---> ", this.state.proposals[proposalIdx], this.state.proposals[proposalIdx].clientId);
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