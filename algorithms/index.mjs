import * as paxos from "./paxos/";
import * as pow from "./pow/";

const algorithms = {
  [paxos.key]: paxos,
  [pow.key]: pow
};

export default algorithms;