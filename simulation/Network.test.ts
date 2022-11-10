import { Network } from "./Network";

describe("Network", () => {
    const nodeA = { id: "A", type: "common" };
    const nodeB = { id: "B", type: "common" };
    const nodeC = { id: "C", type: "other" };
    const network = new Network(nodeA, [nodeB, nodeC]);
    const msg = { "Hello": "World" };

    describe("Internal Communication", () => {
        it("should correctly execute asynchronous communication", () => {
            network.emit(msg);
            const stopListening = network.listen(response => {
                expect(response.Hello).toBe("World")
            });
            stopListening();
        });

        it("should correctly execute synchronous communication", () => {
            network.receive().then((request: any) => {
                network.emit({ ...request, Hello: "Universe" });
            });
            network.emitSync(msg).then((response: any) => {
                expect(response.Hello).toBe("Universe")
            })
        });
    });

    describe("Neighbor Retrieval", () => {
        it("should get all neighbors", () => {
            const neighbors = network.getAllNeighbors();
            expect(neighbors.length).toBe(2);
        });

        it("should get all neighbors of type", () => {
            const neighbors = network.getNeighborsOfType("common");
            expect(neighbors[0].type).toBe("common");
        });

        it("should get a random neighbor of type", () => {
            const neighbor = network.getRandomNeighborOfType("common");
            expect(neighbor).not.toBeFalsy();
        });
    });

    describe("Sending", () => {
        it("should broadcast to all other nodes", () => {
            network.broadcastToAll({});
            // expect(neighbors.length).toBe(1);
        });

        it("should send to specific node", () => {
            network.sendTo("A", msg);
            // network.subcribe
            // expect().toBeCalled();
            // expect(neighbors.length).toBe(1);
        });
    });
});