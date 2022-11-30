import { NodeRunner } from "./NodeRunner";

export interface NodeToWorkerMapping {
  [key: string]: Worker | NodeRunner<any>;
}

type State = any;
type Config = any;

export type customAction = (
  config: Config,
  state: State,
  runners: NodeToWorkerMapping
) => void | Partial<State>;

export function buildControls(config: Config, runners: NodeToWorkerMapping, updateState, stopMessageUpdates, onReset) {
  /* Wrap controls around state */
  const stateFn = (action) => updateState(current => {
    const partial = action(current);
    return { ...current, ...partial };
  });

  const simulationControls = {
    setSpeed: (speed) => updateState(s => ({ ...s, speed })),
    stepForwards: () => stateFn(config.useGlobalState
      ? stepUsingGlobalStates(config, runners, true)
      : step(config, runners, true)),
    stepBackwards: () => stateFn(config.useGlobalState
      ? stepUsingGlobalStates(config, runners, false)
      : step(config, runners, false)),
    pauseOrPlay:  () => stateFn(pauseOrPlay(config, runners, undefined)),
    reset: () => stateFn(reset(config, runners, undefined, stopMessageUpdates, onReset)),
    terminate: terminate(config, runners, stopMessageUpdates)
  };

  const messageControls = () => ({
    delete: () => updateState(s => ({
      ...s,
      selectedElementId: undefined,
      messages: s.messages.filter(msg => msg.id !== s.selectedElementId)
    })),
    modify: (msg) => () => updateState(s => ({
      ...s,
      messages: s.messages.filter(msg => msg.id !== s.selectedElementId).concat(msg)
    }))
  });

  const nodeControls = (element) => ({
    connectOrDisconnect: () => stateFn(connectOrDisconnect(config, runners, element.id)),
    restart: () => stateFn(reset(config, runners, element.id))
  });

  return {
    simulation: simulationControls,
    element: (element) => ({
      ...nodeControls(element),
      ...messageControls(),
      createNewAction: (action: customAction) => () => {
        updateState(current => {
          const partial = action(config, current, runners);
          return { ...current, ...partial };
        });
      },
    })
  }
}

function connectOrDisconnect(config: Config, runners: NodeToWorkerMapping, nodeId: string) {
  return (state) => {
    if (!nodeId) {
      return;
    }
    if (!runners[nodeId]) {
      return;
    }
    runners[nodeId].postMessage({
      isFlow: true,
      type: state.nodes.find(n => n.id === nodeId).connected ? "DISCONNECT" : "RECONNECT",
      nodeId
    });
    return {
      nodes: state.nodes
        .map(n => ({
          ...n,
          connected: nodeId && n.id === nodeId ? !n.connected : n.connected
        }))
    };
  }
}

function pauseOrPlay(config: Config, runners: NodeToWorkerMapping, nodeId: string = undefined) {
  return (state) => {
    Object.values(runners)
      .forEach(r => r.postMessage({
        isFlow: true,
        nodeId,
        type: state.paused ? "RESTART" : "STOP"
      }));
    if (state.paused) {
      // Only reply messages that were undone in the last step
      const deletedMessages = state.messages
        .filter(m => m.deleted)
        .sort(bySentProp);
      if (deletedMessages.length > 0 && deletedMessages[0]) {
        const nodeId = deletedMessages[0].fromId;
        runners[nodeId].postMessage({
          isFlow: true,
          nodeId,
          type: "STEP",
          forward: true
        });
      }
    }
    return {
      paused: typeof(state.paused) === "undefined"
        ? true
        : !state.paused,
      messages: state.paused ? state.messages.filter(m => !m.deleted) : state.messages,
      nodes: state.nodes
        .filter(n => nodeId ? n.id === nodeId : true)
        .map(n => ({ ...n, running: !n.running }))
    };
  }
}

function stepUsingGlobalStates(config: Config, runners: NodeToWorkerMapping, forward = true) {
  return (state) => {
    if (!(window as any).states) {
      (window as any).stateIdx = -1;
      (window as any).states = [];
    }
    if (forward && (
      (window as any).states.length === 0
        || (window as any).stateIdx === (window as any).states.length - 1
    )) {
      const updated =  {
        messages: updateMessagesOnStepForward([], state.messages),
        nodes: state.nodes
      };
      (window as any).states.push(updated);
      return updated;
    } else if (forward) {
      (window as any).stateIdx += 1;
      return (window as any).states[(window as any).stateIdx];
    } else {
      (window as any).stateIdx = Math.max(0, (window as any).stateIdx - 1);
      return (window as any).states[(window as any).stateIdx];
    }
  }
}

function step(config: Config, runners: NodeToWorkerMapping, forward = true) {
  return (state) => {
    if (forward) {
      const messages = state.messages.map(msg => {
        if (msg.done || msg.deleted) {
          return msg;
        } else {
          msg.progress = msg.progress < 0.5 ? 0.5 : 1.0;
          msg.done = msg.progress >= 1.0;
          return msg;
        }
      });
      // This (runners[toId].postMessage) is already done in index.ts -> msgUpdateLoop
      // emitStepForward(messages, runners)
      return { messages };
    } else {
      const undoMessages = [];
      const sortedMessages = state.messages
        .sort(bySentProp(true));
      const mostRecentMessages = sortedMessages
        .reduce(groupByNewestAndBroadcastKey(sortedMessages), []);
      const redoMessages = sortedMessages
        .filter(msg => mostRecentMessages.indexOf(msg) === -1)
        .reduce(groupByNewestAndBroadcastKey(sortedMessages), []);
      const messages = state.messages
        .map(msg => {
          if (mostRecentMessages.indexOf(msg) !== -1) {
            if (msg.progress > 0.5) {
              msg.progress = 0.5;
              msg.done = false;
              msg.deleted = false;
            } else {
              msg.progress = 0;
              msg.deleted = true;
              msg.done = true;
              undoMessages.push(msg);
            }
          } else if (redoMessages.indexOf(msg) !== -1) {
            msg.done = false;
            msg.progress = 0.5;
          }
          return msg;
        }).filter(m => !m.deleted);

      undoMessages.map(msg => msg.fromId)
        .filter(uniq)
        .forEach(nodeId => {
          runners[nodeId].postMessage({
            isFlow: true,
            type: "STEP",
            forward: false
          });
        });
      return { messages };
    }
  }
}

function groupByNewestAndBroadcastKey(sortedDelMessages) {
  return (acc, cur) => {
    if (sortedDelMessages.length === 0) {
      return [];
    }

    const broadcastKey = sortedDelMessages[0].broadcastKey;
    if (!broadcastKey){
      return [sortedDelMessages[0]];
    }

    if (broadcastKey && broadcastKey === cur.broadcastKey) {
      acc.push(cur);
    }
    return acc;
  }
}

function bySentProp(asc = false) {
  return (a: any, b: any) => {
    const aTime = new Date(a.sent).getTime();
    const bTime = new Date(b.sent).getTime();
    if (aTime > bTime) {
      return asc ? -1 : 1;
    } else if (aTime < bTime) {
      return asc ? 1 : -1;
    } else {
      return 0;
    }
  }
}

function updateMessagesOnStepForward(mostRecentMsgs: any[], messages) {
  return messages.map(msg => {
    const isNotRecent = mostRecentMsgs.findIndex(m => m.id === msg.id) == -1;
    if (msg.done || (msg.deleted && isNotRecent)) {
      return msg;
    } else {
      msg.deleted = false;
      msg.progress = msg.progress < 0.5 ? 0.5 : 1.0;
      msg.done = msg.progress >= 1.0;
      return msg;
    }
  });
}

function terminate(config: Config, runners: NodeToWorkerMapping, stopMessageUpdates: () => void) {
  return () => {
    stopMessageUpdates();
    Object.values(runners).forEach(r => r.terminate());
  }
}

function reset(
  config: Config,
  runners: NodeToWorkerMapping,
  id?: string,
  stopMessageUpdates?: () => void,
  onReset?: () => void,
) {
  return (state) => {
    if (id && runners[id]) {
      const node = state.nodes.find(n => n.id === id);
      runners[id].postMessage({
        config,
        isFlow: true,
        type: "RESET",
        nodeId: id,
        nodes: [node],
        neighbors: state.nodes.filter(other => other.id !== node.id)
      });
    } else if (!id) {
      stopMessageUpdates && stopMessageUpdates();
      return onReset && onReset();
    }
    return {};
  }
}

const uniq = (value, index, self) => self.indexOf(value) === index;