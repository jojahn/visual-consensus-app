import { Learner } from "./Learner.mjs";
import {Network} from "../../simulation/Network";

describe("Learner", () => {
  const net = new Network({id: "a"}, []);
  // response to client
  // generation same but value mismatches?

  it("saves no duplicates in log", () => {
    const parentNode = { state: { log: [] } };
    const learner = new Learner("a", net, {}, parentNode);
    learner.onAccepted({ n: 1, v: 1, client: "c1" }).do();
    learner.onAccepted({ n: 1, v: 1, client: "c1" }).do();
    learner.onAccepted({ n: 1, v: 1, client: "c1" }).do();
    expect(parentNode.state.log.length).toBe(1);
  });

  it("updates log", () => {
    const parentNode = { state: { log: [] } };
    const learner = new Learner("a", net, {}, parentNode);
    learner.onAccepted({ n: 1, v: "Hello, World!", client: "c1" }).do();
    expect(parentNode.state.log[0]).toBe("Hello, World!");
  });

  it("sends response to client", () => {
    const parentNode = { state: { log: [] } };
    const learner = new Learner("a", net, {}, parentNode);
    const emit = jest.fn();
    net.emit = (data) => emit(data);
    learner.onAccepted({ n: 1, v: 1, client: "c1" }).do();
    expect(emit).toHaveBeenCalledWith(
      expect.objectContaining({ method: "RESPONSE" })
    );
  });
});