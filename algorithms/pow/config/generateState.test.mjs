import assert from "assert";
import { generateState } from "./generateState.mjs";
import { defaultConfig } from "./defaultConfig.mjs";

describe("Generate pow state", () => {
    const state = generateState(defaultConfig);

    it("should generate all nodes", () => {
        assert.strictEqual(
            state.nodes.length,
            defaultConfig.numberOfNodes + defaultConfig.numberOfClients
        );
        state.nodes.forEach(n => {
            assert.strictEqual(n.running, true);
            assert.strictEqual(n.connected, true);
        });
    });

    it("should not create overlapping positions", () => {
        const minOffset = 10;
        state.nodes.forEach(n => {
            state.nodes
                .filter(other => n.id !== other.id)
                .forEach(other => {
                    const xDiff = Math.abs(n.pos[0] - other.pos[0]) > minOffset;
                    const yDiff = Math.abs(n.pos[1] - other.pos[1]) > minOffset
                    assert.strictEqual(xDiff || yDiff, true);
                });
        });
    });
});