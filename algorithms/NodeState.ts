export interface NodeState {
    id: string;
    pos: [number, number];
    type: string,
    running: boolean,
    connected: boolean,
    state: string
}