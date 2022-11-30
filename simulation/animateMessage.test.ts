import { startMessagesUpdateLoop } from "./animateMessage";
import { StoreMock } from "./StoreMock";

class StoreMockForLoop extends StoreMock {
  nodes = [
    { id: "A", pos: [0, 0] },
    { id: "B", pos: [10, 10] }
  ];
  speed = 1;
  paused = false;
  messages = [];
}

describe("messageUpdateLoop", () => {
  it("sets message in state to done and updates position", async () => {
    const state = new StoreMockForLoop();
    const msg = { fromId: "A", toId: "B", text: "Hello, World!", id: "m_1" };
    const updateLoop = startMessagesUpdateLoop(state.update(), 20);
    const onCompleted = jest.fn(() => {
      updateLoop.stop();
    });
    const result: any = await updateLoop.push(state, msg, onCompleted);
    console.log(result);
    expect(result.pos).toStrictEqual([10, 10]);
    expect(result.done).toBe(true);
    expect(onCompleted).toBeCalled();
  });

  it("should call onCompleted when stepped back", async () => {
    const state = new StoreMockForLoop();
    const msg = { fromId: "A", toId: "B", text: "Hello, World!", id: "m_1" };
    const updateLoop = startMessagesUpdateLoop(state.update(), 20);
    const onCompleted = jest.fn(() => {
      updateLoop.stop();
    });
    await updateLoop.push(state, msg, onCompleted);
    state.paused = true;
    state.messages[0].deleted = true;
    state.messages[0].progress = 0.5;
    state.messages[0].done = false;
    state.paused = false;
    expect(onCompleted).toBeCalledTimes(2);
  });
});