export * from "./setupNode.mjs";
export * from "./config/generateState.mjs"
export * from "./config/defaultConfig.mjs"

export const title = "Bitcoin/Proof-of-Work"
export const key = "bitcoin_pow";

import { seqPaintingOptions } from "./drawing/seqPaintingOptions.mjs";
import { nodePaintingOptions } from "./drawing/nodePaintingOptions.mjs";
import { paintBlockTrails as paintState } from "./drawing/paintBlockTrails.mjs";
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

