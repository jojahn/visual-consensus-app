import { SvelteComponent } from "svelte";
import { Network } from "../simulation/Network";
import { SimulatedNode } from "../simulation/SimulatedNode";
import { AlgorithmState } from "./AlgorithmState";
import { NodeState } from "./NodeState";

export interface Algorithm {
  // unique short key for internal identification
  key: string;
  // Long title for display
  title: string;

  // 
  setupNode: <T extends SimulatedNode, R extends NodeState>(
    config: any,
    state: any,
    internalState: R,
    network: Network
  ) => T;

  defaultConfig: any;
  generateState: (any) => AlgorithmState;

  drawing: {
    nodePaintingOptions?: any;
    seqPaintingOptions?: any;
  }

  components: {
    Actions: SvelteComponent;
    Configuration: SvelteComponent;
    StateGraph?: SvelteComponent;
  };
}