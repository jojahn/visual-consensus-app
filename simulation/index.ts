import NodeRunnerWorker from "./NodeRunnerWorker?worker"
import { NodeRunner } from "./NodeRunner";
import { startMessagesUpdateLoop } from "./animateMessage";
import { buildControls } from "./controls";

export interface UpdateableValue {
  value: any;
  update: (updater: (current: any) => any) => void
}

export default function startSimulation(
  { value: config, update: updateConfig }: UpdateableValue,
  { value: state, update: updateState }: UpdateableValue,
  onReset: () => void
) {
  const msgUpdateLoop = startMessagesUpdateLoop(updateState, config.networkDelay / state.speed);
  const runners = {};
  for (const node of state.nodes) {
    const r = config.useWorkers
      ? new (NodeRunnerWorker as any)({ type: "module", name: node.id })
      : new NodeRunner(config, [node]);
    const runnerListener = (event) => {
      const message = event.data;
      if (message.isFlow) {
        switch(message.type) {
        case "STATE_CHANGED":
          if (!message.data) {
            break;
          }
          updateState(current => ({
            ...current,
            commands: (current.commands || []).concat(...(message.data.scheduledCommands || [])),
            nodes: [...current.nodes.map(
              n => n.id === node.id ? { ...n, ...message.data } : n)]
          }));
          break;
        }
      } else {
        msgUpdateLoop.push(state, message, () => {
          if (message.toId) {
            runners[message.toId].postMessage(message);
          }
        });
      }
    };

    r.onmessage = runnerListener;
    r.onerror = (err) => {
      console.error(err.message, err.error, err);
      // Possibly in Firefox: SyntaxError: import declarations may only appear at top level of a module
      updateConfig(current => ({ ...current, useWorkers: false }));
    }

    if (!config.useWorkers) {
      r.startListening();
    }

    r.postMessage({
      isFlow: true,
      type: "SETUP",
      config,
      nodes: [node],
      neighbors: state.nodes.filter(other => other.id !== node.id)
    });

    runners[node.id] = r;
  }
  const controls = buildControls(config, runners, updateState, msgUpdateLoop.stop, onReset);
  return [runners, controls];
}
