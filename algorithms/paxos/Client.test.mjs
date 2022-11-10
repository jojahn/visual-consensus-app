import assert from "assert";
import { Client } from "./Client.mjs";

describe("Client", () => {
    it(" request includes value and proper method", () => {
        const client = new Client(1);
        const req = client.createRequest("Hello, World!");
        assert.strictEqual(req.method, "REQUEST");
        assert.strictEqual(req.v, "Hello, World!");
    });
});