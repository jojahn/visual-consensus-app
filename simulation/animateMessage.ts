const MESSAGE_STEP = 10;

export function startMessagesUpdateLoop(updateState, duration) {
  const onCompletedMap = { "0": () => undefined };
  let newMessages = [];
  function buildHandler() {
    return () => {
      updateState(current => {
        const missingMessages = [...newMessages];
        newMessages = [];
        // Delete onCompletedMap if message was deleted
        Object.keys(onCompletedMap).forEach(key => {
          if (!current.messages.find(m => m.id === key)
            && !missingMessages.find(m => m.id === key)) {
            onCompletedMap[key] = undefined;
          }
        });
        const uniq = (value, index, self) => self.findIndex(m => m.id === value.id) === index;
        return {
          ...current,
          messages: current.messages
            .concat(...missingMessages)
            .map(updateMessage(current, duration, onCompletedMap))
            .filter(uniq)
        };
      });
    }
  }
  const interval = setInterval(buildHandler(), MESSAGE_STEP);
  return {
    stop: () => clearInterval(interval),
    push: async (state, message, onCompleted: (msg) => void): Promise<any> => {
      return new Promise(resolve => {
        onCompletedMap[message.id] = {
          resolve,
          onCompleted
        }
        const msg = { ...message };
        msg.progress = 0;
        msg.id = message.id;
        newMessages.push(msg);
        msg.pos = state.nodes.filter(n => n.id === message.fromId)[0].pos;
        /* updateState(current => {
          current.messages.push(msg);
          return current;
        }); */
      });
    }
  }
}

function updateMessage(state, duration, onCompletedMap) {
  return msg => {
    // For step-by-step controls allow onCompleted to be called
    if (msg.done && onCompletedMap[msg.id] && !onCompletedMap[msg.id].resolved) {
      onCompletedMap[msg.id].onCompleted(msg);
      onCompletedMap[msg.id].resolved = true;
      onCompletedMap[msg.id]?.resolve(msg);
    }

    if (msg.done) {
      return msg;
    }

    const progress = calculateProgress(state, duration, MESSAGE_STEP, msg.progress);

    const fromNode = state.nodes.filter(n => n.id === msg.fromId)[0];
    const toNode = state.nodes.filter(n => n.id === msg.toId)[0];
    if (!fromNode || !toNode) {
      alert(`got ${msg.fromId} ${msg.toId}`);
      return msg;
    }
    const startPos = fromNode.pos;
    const endPos = toNode.pos;
    msg.pos = [
      startPos[0] + Math.min(progress, 1.0) * (endPos[0] - startPos[0]),
      startPos[1] + Math.min(progress, 1.0) * (endPos[1] - startPos[1])
    ];

    if (progress >= 1.0) {
      msg.done = true;

      if (!onCompletedMap[msg.id]) {
        console.warn("onCompletedMap missing key");
      } else if (msg.progress < 1.0) {
        onCompletedMap[msg.id].onCompleted(msg);
        onCompletedMap[msg.id].resolved = true;
        onCompletedMap[msg.id]?.resolve({
          ...msg,
          done: true
        });
      }
    }
    msg.progress = progress;

    return msg;
  }
}

function calculateProgress(state, duration, messageStep, prevProgress) {
  const gain = duration <= 0 ? 1 : messageStep / (duration / state.speed);
  return Math.min(prevProgress + (state.paused ? 0 : gain), 1);
}
