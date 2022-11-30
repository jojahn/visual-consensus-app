import { encode, decode, minifyKeys, reconstructKeys } from "./configEncoding.mjs";
import { defaultConfig } from "../algorithms/paxos/config/defaultConfig.mjs";
import { generateState } from "../algorithms/paxos/config/generateState.mjs";
import { uniq } from "./uniq.mjs";

const MAX_URL_LENGTH = 2048

describe("Configuration En-/Decoding for size optimization", () => {
    const config = defaultConfig;
    const jsonString = JSON.stringify(config);

    describe("minifyKeys", () => {
        it("creates no duplicates", () => {
            let [result, _] = minifyKeys(config);
            expect(Object.keys(result).filter(uniq).length).toBe(Object.keys(result).length);
        });
    });

    describe("reconstructKeys", () => {
        it("creates the same keys", () => {
            const obj = {
                hello: 1,
                he: 2,
                world: 3
            };
            let [minified, keyMap] = minifyKeys(obj);
            const reconstructed = reconstructKeys(minified, keyMap);
            expect(reconstructed).toStrictEqual(expect.objectContaining(obj));
        });

        it("applies to nested keys", () => {
            const obj = { left: { right: { center: 1 }}};
            let [minified, keyMap] = minifyKeys(obj);
            const reconstructed = reconstructKeys(minified, keyMap);
            expect(reconstructed).toStrictEqual(expect.objectContaining(obj));
        });

        it("applies to arrays", () => {
            const obj = { left: [{id: 1, right: 2}, {id: 1, center: 3}]};
            let [minified, keyMap] = minifyKeys(obj);
            const reconstructed = reconstructKeys(minified, keyMap);
            expect(reconstructed).toStrictEqual(expect.objectContaining(obj));
        });
    });

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
            let [result, keyMap] = encode(config);
            result = decode(result, keyMap);
            expect(result).toStrictEqual(config);
        });
    });
});