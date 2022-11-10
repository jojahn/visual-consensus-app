import { SimulatedNode } from "./SimulatedNode.mjs";

class TestNode extends SimulatedNode {
    constructor() {
        super("T0", null, null, { sendTo: () => undefined });
        this.value = 0;
    }

    add() {
        return {
            do: () => {
                this.value++;
            },
            undo: () => {
                this.value--;
            }
        }
    }
}

describe("SimulatedNode", () => {
    describe("Command Execution", () => {
        it("A command will immediately executed", () => {
            const node = new TestNode();
            let cmd = node.add();
            node.invoke(cmd);
            expect(node.value).toBe(1);
        });

        it("A paused node will not execute a command immediately", () => {
            const node = new TestNode();
            node.running = false;
            let cmd = node.add();
            node.invoke(cmd);
            expect(node.value).toBe(0);
        });

        it("A paused node will execute a command step by step", () => {
            const node = new TestNode();
            node.running = false;
            let cmd = node.add();

            node.invoke(cmd);
            node.invoke(cmd);
            node.invoke(cmd);
            expect(node.value).toBe(0);

            node.step();
            expect(node.value).toBe(1);

            node.step();
            expect(node.value).toBe(2);

            node.step();
            expect(node.value).toBe(3);
        });

        it("A command can be reversed", () => {
            const node = new TestNode();
            let cmd = node.add();
            node.invoke(cmd);
            node.step(false);
            expect(node.value).toBe(0);
        });

        it("A reversed command can be executed again", () => {
            const node = new TestNode();
            let cmd = node.add();
            node.invoke(cmd);
            node.step(false);
            node.step(true);
            expect(node.value).toBe(1);
        });
    });
});