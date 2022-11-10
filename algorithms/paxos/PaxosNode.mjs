import { SimulatedNode } from "../../simulation/SimulatedNode";
import { Acceptor } from "./Acceptor.mjs";
import { Learner } from "./Learner.mjs";
import { Proposer } from "./Proposer.mjs";

export class PaxosNode extends SimulatedNode {
  constructor(id, config, state, network, nodeType="node") {
    super(id, config, state, network);
    this.type = nodeType;
    this.state.log = [];
        
    if (nodeType === "node" || nodeType === "acceptor") {
      this.acceptor = new Acceptor(id, network);
      this.state.acceptor = this.acceptor.state;
    }
    if (nodeType === "node" || nodeType === "learner") {
      this.learner = new Learner(id, network);
      this.state.learner = this.learner.state;
    }
    if (nodeType === "node" || nodeType === "proposer") {
      this.proposer = new Proposer(id, network);
      this.state.proposer = this.proposer.state;
    }
  }

  onmessage(msg) {
    // import.meta.env.DEV && console.log(`PaxosNode "${this.id}" got:`, msg);
    this.proposer && this.handleProposerMessage(msg);
    this.acceptor && this.handleAcceptorMessage(msg);
    this.learner && this.handleLearnerMessage(msg);
  }

  handleProposerMessage(msg) {
    switch(msg.method) {
    case "REQUEST":
      this.invoke(this.proposer.onRequest(msg));
      break;
    case "PROMISE":
      this.invoke(this.proposer.onPromise(msg));
      break;
    case "ACCEPTED":
      this.invoke(this.proposer.onAccepted(msg));
      break;
    case "IGNORED":
      this.invoke(this.proposer.onIgnored(msg));
      break;
    }
  }

  handleAcceptorMessage(msg) {
    switch(msg.method) {
    case "PREPARE":
      this.invoke(this.acceptor.onPrepare(msg));
      break;
    case "ACCEPT":
      this.invoke(this.acceptor.onAccept(msg));
      break;
    }
  }

  handleLearnerMessage(msg) {
    switch(msg.method) {
    case "ACCEPTED":
      this.invoke(this.learner.onAccepted(msg));
      break;
    }
  }
}