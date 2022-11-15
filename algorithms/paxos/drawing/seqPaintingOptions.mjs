import { paintingOptions as defaultPaintingOptions } from "../../../drawing/paintSequenceDiagram.mjs";

export const seqPaintingOptions = {
  ...defaultPaintingOptions,
  getText: (msg) => {
    let result = msg.method;
    switch(msg.method) {
      case "REQUEST":
        result += ` (${msg.v})`;
        break;
      case "PROMISE": case "PREPARE": case "IGNORED":
        result += ` (${msg.n})`;
        break;
      case "ACCEPT": case "ACCEPTED":
        result += ` (${msg.n + ", " + msg.v})`
        break;
    }
    return result;
  }
}