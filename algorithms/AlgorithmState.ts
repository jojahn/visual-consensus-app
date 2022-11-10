import { Message } from "./Message";
import { NodeState } from "./NodeState";

export interface AlgorithmState {
    selectedElementId: undefined,
    started: string,
    speed: number,
    nodes: NodeState[],
    messages: Message[]
}
  