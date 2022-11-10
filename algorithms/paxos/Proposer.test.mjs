import assert from "assert";
import { Proposer } from "./Proposer.mjs";
import { Network } from "../../simulation/Network";

describe("Proposer", () => {
  const net = new Network({ id: "a" }, [
    { id: "b", type: "node" },
    { id: "c", type: "node" },
    { id: "d", type: "node" }
  ]);

  describe("consensus rules", () => {
  });

  it("should correctly calculate majority", () => {
    const p = new Proposer("a", net);
    p.state.proposals = [{ n: 1, promises: ["b", "c"] }];
    expect(p.hasMajority(1)).toBeTruthy();
  });
});