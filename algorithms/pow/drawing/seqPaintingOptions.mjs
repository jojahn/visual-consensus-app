import { paintingOptions as defaultPaintingOptions } from "../../../drawing/paintSequenceDiagram.mjs";

export const seqPaintingOptions = {
  ...defaultPaintingOptions,
  getText: (msg) => {
    if (msg.command === "rawtransaction") {
      return `${msg.command} (${msg.tx})`
    } else if (msg.command === "submitblock" && msg.block.transactions) {
      return `${msg.command} (${msg.block.transactions.join(", ")})`
    } else {
      return `${msg.command}`
    }
  }
}