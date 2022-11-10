import assert from "assert";
import { Acceptor } from "./Acceptor.mjs";

describe("Acceptor", () => {
    describe("Paxos Rules", () => {
        it("An acceptor must accept the first proposal that it receives", () => {
            const acceptor = new Acceptor(1);
            const response = acceptor.onAccept(1, 2);
            assert.strictEqual(response.method, "PROMISE");
        });
    });
});