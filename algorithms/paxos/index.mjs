export * from "./setupNode.mjs";
export * from "./config/generateState.mjs";
export * from "./config/defaultConfig.mjs";

export const title = "Paxos"
export const key = "paxos";

import { seqPaintingOptions } from "./drawing/seqPaintingOptions.mjs";
import { nodePaintingOptions } from "./drawing/nodePaintingOptions.mjs";
import { paintReplicatedLog as paintState } from "./drawing/paintReplicatedLog.mjs";
export const drawing = {
  seqPaintingOptions,
  nodePaintingOptions,
  paintState
};

import { default as Configuration } from "./components/Configuration.svelte";
import { default as Actions } from "./components/Actions.svelte";
import { default as StateGraph } from "./components/StateGraph.svelte";
export const components = {
  Configuration,
  Actions,
  StateGraph
};
