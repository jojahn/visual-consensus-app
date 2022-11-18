import * as paxos from "./paxos/";
import * as pow from "./pow/";

const algorithms = {
  [paxos.key]: paxos,
  // TODO: Fix Proof of Work integration
  // [pow.key]: pow
};

export default algorithms;