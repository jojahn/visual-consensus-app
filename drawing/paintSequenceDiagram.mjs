import {
  sortMessageBySentDate,
  groupBySentDateAndProperties
} from "./paintStabilizing.ts"
import { COLORS } from "./colors.ts";

export const paintingOptions = {
  linePadding: 50,
  initialLineLength: 200,
  lengthPerTimeStep: 10,
  groupOffset: 30,
  // Space between different messages starts and ends
  messageOffset: 8,
  // y difference between the start and end of a message
  maxMessageLength: 30,
  maxMessageOffset: 100,
  vertical: false,
  autoAlign: "TOP_TO_BOTTOM",
  spaceBetweenBroadcasts: false,
  getText: (msg) => msg.type
};

// TODO: Use timestep for safety but fix large gaps before
/* function messagePosition(date, state, { lengthPerTimeStep }) {
  return lengthPerTimeStep * ((date.getTime() - state.started.getTime()) / 1000 * state.speed);
} */

export function paintSequenceDiagram(context, state, mouseCursor, options = paintingOptions) {
  options = { ...paintingOptions, ...options };
  if (!state) {
    return [context.canvas.width, context.canvas.height];
  }
  options.internal = {};
  options.internal.nodeToXMap = {};
  state.nodes.forEach((n, i) => {
    options.internal.nodeToXMap[n.id] = 10 + i * options.linePadding;
    options.internal.furthestLineX = options.internal.nodeToXMap[n.id];
  });

  const groupByTextOrBroadcastKey = (a, b) => {
    if (options.getText(a) === options.getText(b)) {
      return true;
    }
    if (a.broadcastKey !== undefined && b.broadcastKey !== undefined) {
      return a.broadcastKey === b.broadcastKey;
    }
    return false;
  }

  context.save();
  options.internal.lastLineOffset = 25;
  options.internal.maxWidth = options.internal.furthestLineX;
  state.messages
    .sort(sortMessageBySentDate)
    .reduce(groupBySentDateAndProperties(1000, groupByTextOrBroadcastKey), [])
    .forEach(
      paintMessage(
        context,
        state,
        options
      )
    );
  context.restore();

  context.save();
  state.nodes.forEach((n, i) => {
    let lineOffset = 10 + i * options.linePadding;
    options.internal.nodeToXMap[n.id] = lineOffset;

    if (state.selectedElementId === n.id) {
      context.beginPath();
      context.lineWidth = 10;
      context.strokeStyle =  COLORS.highlight;
      let startPos = [options.internal.nodeToXMap[state.selectedElementId], 25];
      let endPos = [
        options.internal.nodeToXMap[state.selectedElementId],
        Math.max(options.initialLineLength, options.internal.lastLineOffset + options.messageOffset)
      ];
      if (options.vertical) {
        startPos = startPos.reverse();
        endPos = endPos.reverse();
      }
      context.moveTo(...startPos);
      context.lineTo(...endPos);
      context.stroke();
      context.closePath();
    }

    context.beginPath();
    context.lineWidth = 1;
    context.setLineDash(!n.connected ? [5, 5] : [0]);
    context.strokeStyle = !n.connected ? "#AAA" : "#000";
    let startPos = [options.internal.nodeToXMap[n.id], 25];
    let endPos = [
      options.internal.nodeToXMap[n.id],
      Math.max(options.initialLineLength, options.internal.lastLineOffset + options.messageOffset)
    ];
    if (options.vertical) {
      startPos = startPos.reverse();
      endPos = endPos.reverse();
    }
    context.moveTo(...startPos);
    context.lineTo(...endPos);
    context.stroke();
    context.closePath();
    context.setLineDash([0]);

    context.beginPath();
    context.fillStyle = "#000";
    context.font = "bold 20px courier new";
    context.fontWeight = "bold";
    let textPos = [lineOffset - 7.5, 20];
    if (options.vertical) {
      textPos = textPos.reverse();
    }
    context.fillText(n.id, ...textPos);
    context.closePath();
  });
  context.restore();

  return [options.internal.maxWidth, options.internal.lastLineOffset + options.messageOffset];
}

function paintMessage(context, state, options, innerIdx = 0, isLast = true) {
  return (msg, outerIdx) => {
    if (Array.isArray(msg)) {
      msg.forEach((m, innerIdx) =>
        paintMessage(
          context, state, options, innerIdx, innerIdx === msg.length-1
        )(m, outerIdx));
      return;
    }

    const { nodeToXMap, furthestLineX } = options.internal;

    context.beginPath();
    let msgYPos = options.internal.lastLineOffset;
    if (outerIdx === 0) {
      msgYPos += options.messageOffset;
    }
    if (options.spaceBetweenBroadcasts && innerIdx !== 0) {
      msgYPos += options.messageOffset;
    }
    let startPos = [nodeToXMap[msg.fromId], msgYPos];
    let endPos = [
      nodeToXMap[msg.toId],
      startPos[1] + (options.spaceBetweenBroadcasts ? 0 : options.maxMessageLength)
    ];

    if (isLast || options.spaceBetweenBroadcasts) {
      options.internal.lastLineOffset = endPos[1];
      if (isLast && options.spaceBetweenBroadcasts) {
        options.internal.lastLineOffset += options.groupOffset;
      } else {
        options.internal.lastLineOffset += options.messageOffset;
      }
    }

    if (options.vertical) {
      startPos = startPos.reverse();
      endPos = endPos.reverse();
    }
    if (msg.id === state.selectedElementId) {
      context.lineWidth = 8;
      context.strokeStyle = COLORS.highlight;
      context.moveTo(...startPos);
      context.lineTo(...endPos);
      context.stroke();
    }
    context.lineWidth = 1;
    context.strokeStyle = "#000";
    context.moveTo(...startPos);
    context.lineTo(...endPos);
    context.stroke();
    context.closePath();

    if (innerIdx === 0) {
      context.beginPath();
      context.fillStyle = "#000";
      context.font = "15px arial";
      let textPos = [furthestLineX + 20, startPos[1] + (endPos[1] - startPos[1])/2];
      if (options.spaceBetweenBroadcasts) {
        textPos[1] = startPos[1] + (options.internal.lastLineOffset - startPos[1])/2;
      }
      if (options.vertical) {
        textPos = textPos.reverse();
      }
      const text = options.getText(msg);
      options.internal.maxWidth = Math.max(options.internal.maxWidth, textPos[0] + (text.length * 15));
      context.fillText(text, ...textPos);
      context.closePath();
    }
  }
}