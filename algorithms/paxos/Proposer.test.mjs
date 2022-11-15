import assert from "assert";
import { Proposer } from "./Proposer.mjs";
import { Network } from "../../simulation/Network";

describe("Proposer", () => {
  const buildNet = () => new Network({ id: "a" }, [
    { id: "b", type: "node" },
    { id: "c", type: "node" },
    { id: "d", type: "node" }
  ]);

  describe("Paxos Rules", () => {
    it("sends acceptances only if majority is reached", () => {
      const net = buildNet();
      const proposer = new Proposer("a", net);
      proposer.state.proposals = [{ n: 1, promises: [], acceptances: [] }];
      const emit = jest.fn();
      net.emit = (data) => emit(data);
      proposer.onPromise({ n: 1, fromId: "b" }).do();
      proposer.onPromise({ n: 1, fromId: "c" }).do();
      expect(emit).toBeCalledTimes(3);
      expect(emit).toHaveBeenCalledWith(
        expect.objectContaining({ method: "ACCEPT" })
      );
    });
  });

  it("should correctly calculate majority", () => {
    const p = new Proposer("a", buildNet());
    p.state.proposals = [{ n: 1, promises: ["b", "c"], acceptances: ["b", "c"] }];
    expect(p.hasMajority(1)).toBeTruthy();
    expect(p.hasMajority(1, false)).toBeTruthy();
  });

  it("increases generation if majority is reached", () => {
    const proposer = new Proposer("a", buildNet());
    proposer.state.proposals = [{ n: 1, promises: ["b", "c", "d"], acceptances: [] }];
    proposer.onAccepted({ n: 1, v: 2, fromId: "b" }).do();
    proposer.onAccepted({ n: 1, v: 2, fromId: "c" }).do();
    expect(proposer.state.n).toBe(2);
  });

  it("increases generation if ignored", () => {
    const proposer = new Proposer("a", buildNet());
    proposer.state.proposals = [{ n: 1, promises: ["b", "c", "d"], acceptances: [] }];
    proposer.onIgnored({ n: 1, v: 2, fromId: "b" }).do();
    expect(proposer.state.n).toBe(2);
  });
});