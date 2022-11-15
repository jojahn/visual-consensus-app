import assert from "assert";
import { Network } from "../../simulation/Network";
import { Acceptor } from "./Acceptor.mjs";

describe("Acceptor", () => {
    describe("Paxos Rules", () => {
        it("must promise the first proposal that it receives", () => {
            const netA = new Network({ id: "A" }, [{ id: "B" }]);
            const acceptor = new Acceptor("A", netA);
            acceptor.state.greatestN = 0;
            const emit = jest.fn();
            netA.emit = (data) => emit(data);
            acceptor.onPrepare({ n: 1, fromId: "B" }).do();
            expect(emit).toHaveBeenCalledWith(
              expect.objectContaining({ method: "PROMISE" })
            );
        });

        it("does not promise proposals with lower generations", async () => {
            const netA = new Network({ id: "A" }, [{ id: "B" }]);
            const acceptor = new Acceptor("A", netA);
            acceptor.state.greatestN = 99;
            const emit = jest.fn();
            netA.emit = (data) => emit(data);
            acceptor.onPrepare({ n: 1, fromId: "B" }).do();
            expect(emit).toHaveBeenCalledWith(
              expect.objectContaining({ method: "IGNORED" })
            );
        });
    });
});