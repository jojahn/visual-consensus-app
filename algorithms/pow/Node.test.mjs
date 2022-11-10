import assert from "assert";
import { Node } from "./Node.mjs";
import { Network } from "../../simulation/Network";
import {hash} from "../../utils/hashing.mjs";
import {genesisBlock} from "./genesisBlock.mjs";

function enrichOnMessage(node) {
    return (msg) => {
        node.onmessage(msg);
    }
}

describe("Bitcoin Proof-of-Work Node", () => {
    describe("consensus", function () {
        const net = new Network({ id: "N1" }, []);
        const tx = { tx: "TX_A", timestamp: new Date().getTime() };

        it("should not save a transaction again if it was already included in the chain", async () => {
            const node = new Node("N1", undefined, {}, net);
            node.onRawTransaction(tx)();
            expect(node.state.mempool.length).toBe(1);
            await node.tryMining()();
            node.onRawTransaction(tx)();
            expect(node.state.mempool.length).toBe(0);
        });

        it("should detect duplicate blocks", async () => {
            const node = new Node("N1", undefined, {}, net);
            node.onRawTransaction(tx)();
            expect(node.state.mempool.length).toBe(1);
            await node.tryMining()();
            const block = node.state.chain[1];
            node.onSubmitBlock({ block: {
                ...block,
                transactions: [ ...block.transactions ],
                height: 100 }
            })();
            expect(node.state.chain.length).toBe(2);
        });
    });


    describe("bootstrapping", () => {
        it("should ask other nodes for blocks", () => {
            const net = new Network({ id: "IBD" }, [{ id: "SYNC", type: "node" }]);
            new Node("IBD", undefined, {}, net);
            const stopListening = net.listen((msg) => {
                expect(msg.command).toBe("getblocks");
            });
            stopListening();
        });

        it("should return its blocks onGetData", () => {
            const net = new Network({ id: "SYNC" }, []);
            const sync = new Node("SYNC", undefined, {}, net);
            const block1 = { id: "Block1" };
            sync.chain.push(block1);
            sync.onGetData("getData")
            const stopListening = net.listen((msg) => {
                expect(msg.command).toBe("blocks");
                expect(msg.blocks[0]).toBe(block1);
            });
            stopListening();
        });

        it("should only save valid blocks", async () => {
            const block1 = { header: { prevHeaderHash: await hash(genesisBlock.header) }};
            const block2 = { header: { prevHeaderHash: await hash(block1.header) }};
            const invalidBlock = { id: "invalidBlock", header: { prevHeaderHash: await hash({ id: undefined }) }};

            const net = new Network({ id: "SYNC" }, []);
            const sync = new Node("SYNC", undefined, {}, net);

            await sync.onBlocks({
                entries: [block1, block2, invalidBlock]
            }).do();
            expect(sync.chain.length).toBe(3);
            expect(sync.chain[0]).toBe(genesisBlock);
            expect(sync.chain[1]).toBe(block1);
            expect(sync.chain[2]).toBe(block2);
        });
    })

});