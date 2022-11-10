import { NodeRunner } from "./NodeRunner";

describe("NodeRunner", () => {
  const config = {};
  const nodeStates = [{ id: "A1" }];

  describe("Messaging", () => {
    it("listens on NodeRunnerEvent[s]", () => {
      const r = new NodeRunner(config, nodeStates);
      r.onmessage = jest.fn();
      r.startListening();
      window.dispatchEvent(new CustomEvent("NodeRunnerEvent", { detail: { nodeId: "A1" } }));
      expect(r.onmessage).toBeCalled();
      r.terminate();
    });

    it("", () => {
      const r = new NodeRunner(config, nodeStates);
      r.postMessage( { "Hello": "World" });
    });

    /* it("", () => {
      const r = new NodeRunner(config, nodeStates);
      r.buildMessageEventHandler()
    }); */

    /* it("", () => {
      const r = new NodeRunner(config, nodeStates);
      r.onFlowMessage()
    }); */
  });

  describe("Setup", () => {
    it("Creates Nodes", () => {
      const config = { algorithm: "paxos" };
      const nodeStates = [{ id: "A1" }];
      const r = new NodeRunner(config, nodeStates);
      r.setupNodes(config, nodeStates, []);
      expect((r as any).nodes.length).toBe(1);
    });
  });
});