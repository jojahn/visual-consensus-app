import { Network } from "../../simulation/Network";
import { Client } from "./Client.mjs";

describe("Client", () => {
    it(" request includes value and proper method", () => {
        const net = new Network({id: "C1"}, { id: "N1", type: "node" });
        const emit = jest.fn();
        net.emit = emit;
        const client = new Client("C1", {}, {}, net);
        client.request("N1", "Hello, World!").do();
        expect(emit).toHaveBeenCalledWith(
            expect.objectContaining({ method: "REQUEST", v: "Hello, World!" })
        );
    });
});