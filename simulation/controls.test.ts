import { buildControls, NodeToWorkerMapping } from "./controls";
import {StoreMock} from "./StoreMock";

class MockRunner {
  counter = 0;
  commands = [];
  connected = true;

  postMessage(msg) {
    if (msg.type === "STEP" && msg.forward) {
      this.counter += 1;
      this.commands.push(() => this.counter -= 1);
    } else if (msg.type === "STEP" && !msg.forward) {
      this.undo();
    } else if (msg.type === "DISCONNECT") {
      this.connected = false;
    } else if (msg.type === "RECONNECT") {
      this.connected = true;
    } else if (msg.type === "RESET") {
      this.counter = 0;
    }
  }

  undo() {
    const cmd = this.commands.pop();
    if (cmd) cmd();
  }
}

describe("controls", () => {
    const config = {};
    const runners: NodeToWorkerMapping = {
      "A1": new MockRunner() as any,
      "A2": new MockRunner() as any
    };

    describe("Simulation Controls", () => {
      it("should update state", () => {
        const store: any = new StoreMock();
        const controls = buildControls(config, runners, store.update(), () => undefined, () => undefined);
        controls.simulation.setSpeed(0.5);
        expect(store.speed).toBe(0.5);
      });

      it("should execute reset callback", () => {
        const store: any = new StoreMock();
        const onReset = jest.fn();
        const controls = buildControls(config, runners, store.update(), () => undefined, onReset);
        controls.simulation.reset();
        expect(onReset).toBeCalled();
      });

      it("should correctly execute step-by-step commands", () => {
        const store: any = new StoreMock();
        store.messages = [
          { fromId: "A1", progress: 0.99, done: false, deleted: false, sent: new Date().getTime() },
        ];
        const controls = buildControls(config, runners, store.update(), () => undefined, () => undefined);

        for (let i = 0; i < 5; i++) {
          controls.simulation.stepForwards();
          controls.simulation.stepForwards();
          expect(store.messages[0].done).toBeTruthy();
          expect(store.messages[0].progress).toBeCloseTo(1.0);

          controls.simulation.stepBackwards();
          expect(store.messages[0].progress).toBeCloseTo(0.5);
  
          controls.simulation.stepBackwards();
          expect(store.messages[0].progress).toBeCloseTo(0);

          store.messages.push(
            { fromId: "A1", progress: 1.0, done: false, deleted: false, sent: new Date().getTime() }
          );
        }
      });

      describe("should mark last executed message as deleted if stepped backwards", () => {
        const store: any = new StoreMock();
        const now = new Date().getTime();
        const controls = buildControls(config, runners, store.update(), () => undefined, () => undefined);

        test.each([0, 1, 2, 3, 4])("step forwards", (idx) => {
          store.messages.push({ id: `M_${idx}`, fromId: "A1", progress: 0, done: false, deleted: false, sent: now + idx * 1000 });
          controls.simulation.stepForwards();
          controls.simulation.stepForwards();
          expect(store.messages[idx].progress).toBe(1);
        });

        test.each([0, 1, 2, 3, 4].reverse())("step backwards", (idx) => {
          controls.simulation.stepBackwards();
          controls.simulation.stepBackwards();
          expect(store.messages[idx].deleted).toBeTruthy();
          expect(store.messages[idx].progress).toBe(0);
        });
      });

      it("should group all messages with the same broadcastKey", () => {
        const store: any = new StoreMock();
        const now = new Date().getTime();
        const controls = buildControls(config, runners, store.update(), () => undefined, () => undefined);

        store.messages.push({
          id: `M_1`,
          fromId: "A1",
          progress: 0,
          sent: now,
          broadcastKey: "B_KEY"
        });

        store.messages.push({
          id: `M_2`,
          fromId: "A1",
          progress: 0,
          sent: now + 1000,
          broadcastKey: "B_KEY"
        });

        controls.simulation.stepForwards();
        controls.simulation.stepForwards();
        expect(store.messages[0].done).toBeTruthy();
        expect(store.messages[0].progress).toBe(1);
        expect(store.messages[1].done).toBeTruthy();
        expect(store.messages[1].progress).toBe(1);

        controls.simulation.stepBackwards();
        controls.simulation.stepBackwards();
        expect(store.messages[0].deleted).toBeTruthy();
        expect(store.messages[0].progress).toBe(0);
        expect(store.messages[1].deleted).toBeTruthy();
        expect(store.messages[1].progress).toBe(0);
      });

      it("should prevent forks when paused, stepped backwards and started again", () => {
        const store: any = new StoreMock();
        const controls = buildControls(config, runners, store.update(), () => undefined, () => undefined);
        controls.simulation.pauseOrPlay();

        store.messages.push({ fromId: "A1", id: "a", progress: 0, sent: new Date().getTime() });
        controls.simulation.stepForwards();
        controls.simulation.stepForwards();
        controls.simulation.stepBackwards();
        controls.simulation.stepBackwards();
        controls.simulation.pauseOrPlay();

        expect(store.messages.length).toBe(0);
      });

      it("should prevent forks when paused, stepped backwards and stepped forwards again", () => {
        const store: any = new StoreMock();
        const controls = buildControls(config, runners, store.update(), () => undefined, () => undefined);

        store.messages.push({ fromId: "A1", id: "a", progress: 0, sent: new Date().getTime() });
        controls.simulation.stepForwards();
        controls.simulation.stepForwards();
        controls.simulation.pauseOrPlay();

        controls.simulation.stepBackwards();
        controls.simulation.stepBackwards();
        expect(store.messages[0].deleted).toBeTruthy();

        controls.simulation.stepForwards();
        controls.simulation.stepForwards();
        expect(store.messages[0].done).toBeTruthy();
        expect(store.messages[0].progress).toBeGreaterThanOrEqual(1);
        expect(store.messages[0].deleted).toBeFalsy();
      });

      it("should pause simulation", () => {
        const store: any = new StoreMock();
        const controls = buildControls(config, runners, store.update(), () => undefined, () => undefined);
       
        controls.simulation.pauseOrPlay();
        expect(store.paused).toBeTruthy();

        controls.simulation.pauseOrPlay();
        expect(store.paused).toBeFalsy();
      });
    });

    describe("Element Controls", () => {
      describe("Message Controls", () => {
        it("should delete messages", () => {
          const store: any = new StoreMock();
          store.messages.push({ id: "a" });
          store.selectedElementId = "a";
          expect(store.messages.length).toBe(1);
          const controls = buildControls(config, runners, store.update(), () => undefined, () => undefined);
          controls.element(store.messages[0]).delete();
          expect(store.messages.length).toBe(0);
        });

        it("should modify messages", () => {
          const store: any = new StoreMock();
          store.messages.push({ id: "a", value: 1 });
          store.selectedElementId = "a";
          expect(store.messages[0].value).toBe(1);
          const controls = buildControls(config, runners, store.update(), () => undefined, () => undefined);
          controls.element(store.messages[0]).modify({ id: "a", value: 2 })();
          expect(store.messages[0].value).toBe(2);
        });
      });

      describe("Node Controls", () => {
        it("should be able to disconnect and reconnect nodes", () => {
          const runners: any = { "A1": new MockRunner() };
          const store: any = new StoreMock();
          store.nodes.push({ id: "A1", connected: true });
          store.selectedElementId = "A1";
          const controls = buildControls(config, runners, store.update(), () => undefined, () => undefined);
          expect(runners["A1"].connected).toBeTruthy();
          controls.element(store.nodes[0]).connectOrDisconnect();
          expect(runners["A1"].connected).toBeFalsy();
          controls.element(store.nodes[0]).connectOrDisconnect();
          expect(runners["A1"].connected).toBeTruthy();
        });

        it("should be able to restart nodes", () => {
          const runners: any = { "A1": new MockRunner() };
          const store: any = new StoreMock();
          store.nodes.push({ id: "A1" });
          store.selectedElementId = "A1";
          const controls = buildControls(config, runners, store.update(), () => undefined, () => undefined);
          runners["A1"].counter += 1;
          controls.element(store.nodes[0]).restart();
          expect(runners["A1"].counter).toBe(0);
        });
      });

      describe("Custom Action API", () => {
        it("should create new action", () => {
          const store: any = new StoreMock();
          store.value = 1;
          const controls = buildControls(config, runners, store.update(), () => undefined, () => undefined);
          const element = {};
          const actionBuilder = (_config, state, _runners) => {
              return { value: ++state.value };
          };
          const action = controls.element(element).createNewAction(actionBuilder);
          action();
          expect(store.value).toBe(2);
        });
      });
    });
});