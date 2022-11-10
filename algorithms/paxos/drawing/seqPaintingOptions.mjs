import { paintingOptions as defaultPaintingOptions } from "../../../drawing/paintSequenceDiagram.mjs";

export const seqPaintingOptions = {
  ...defaultPaintingOptions,
  getText: (msg) => `${msg.method} (${msg.method !== "REQUEST" ? msg.n + ", " : ""}${msg.v})`
}