import { encode, decode } from "./configEncoding.mjs";
import { defaultConfig } from "../algorithms/paxos/config/defaultConfig.mjs";
import { generateState } from "../algorithms/paxos/config/generateState.mjs";

const MAX_URL_LENGTH = 2048

describe("Configuration En-/Decoding for size optimization", () => {
    const config = defaultConfig;
    const jsonString = JSON.stringify(config);
    describe("Encoding", () => {
        it("generates a string shorter than the object", () => {
            let result = encode(config);
            expect(result.length).toBeLessThan(jsonString.length);
        });

        it("generates a string from state and config shorter than max URL length", () => {
            let configResult = encode(config);
            let stateResult = encode(generateState(config));
            expect(stateResult.length + configResult.length).toBeLessThan(MAX_URL_LENGTH);
        });
    });

    describe("Decoding", () => {
        it("matches input and output value", () => {
            let result = encode(config);
            result = decode(result);
            expect(result).toStrictEqual(config);
        });
    });
});