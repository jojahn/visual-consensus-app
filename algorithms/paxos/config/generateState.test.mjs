import assert from "assert";
import { generateState } from "./generateState.mjs";

describe("generatePaxosState", () => {
    const state = generateState({
        numberOfLearners: 1,
        numberOfAcceptors: 2,
        numberOfProposers: 3,
        numberOfClients: 4
    });

    it("States always start with an empty messages array", () => {
        assert.strictEqual(state.messages.length, 0);
    });

    it("The state must always have the correct amount of nodes", () => {
        assert.strictEqual(state.nodes.filter(n => n.type === "learner").length, 1);
        assert.strictEqual(state.nodes.filter(n => n.type === "acceptor").length, 2)
        assert.strictEqual(state.nodes.filter(n => n.type === "proposer").length, 3);
        assert.strictEqual(state.nodes.filter(n => n.type === "client").length, 4);
    });
});