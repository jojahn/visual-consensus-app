import { sortMessageBySentDate } from "./paintStabilizing.ts";
import { COLORS } from "./colors.ts";

export const paintingOptions = {
  nodeRadius: 24,
  messageRadius: 8,
  paintNodeText: (node) => node.id,
  isLeader: () => undefined,
  paintMessageText: () => undefined,
  arrowLength: 6
}

export function paintNodeGraph(context, state, mouseCursor, options = paintingOptions) {
  context.save();
  options = { ...paintingOptions, ...options };

  if (!state) {
    return [context.canvas.width, context.canvas.height];
  }
  let maxWidth = 0;
  let maxHeight = 0;
  // Message Line
  state.messages
    .filter(msg => !msg.done && msg.pos)
    .forEach(msg => {
      context.beginPath();
      let fromPos = state.nodes.filter(n => n.id === msg.fromId)[0].pos;
      let toPos = state.nodes.filter(n => n.id === msg.toId)[0].pos;

      if (msg.id === state.selectedElementId) {
        context.lineWidth = 4;
        context.strokeStyle = COLORS.highlight;
        context.moveTo(...fromPos);
        context.lineTo(...toPos);
        context.stroke();
      }

      context.lineWidth = 1;
      context.strokeStyle = "#DDD";
      context.moveTo(...fromPos);
      context.lineTo(...toPos);
      context.stroke();
      context.closePath();
    });

  // Message Circle
  state.messages
    .filter(msg => !msg.done && msg.pos)
    .sort(sortMessageBySentDate)
    .forEach(msg => {
      // Highlighting circle
      if (msg.id === state.selectedElementId) {
        context.beginPath();
        context.fillStyle = COLORS.highlight;
        context.arc(msg.pos[0], msg.pos[1], options.messageRadius + 5, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
      }

      // Arrows
      context.beginPath();
      const fromPos = state.nodes.filter(n => n.id === msg.fromId)[0].pos;
      const toPos = state.nodes.filter(n => n.id === msg.toId)[0].pos;
      const distance = Math.sqrt(
        Math.pow(fromPos[0] - toPos[0], 2) +
        Math.pow(fromPos[1] - toPos[1], 2)
      );
      const arrowDist = options.messageRadius + options.arrowLength;
      const arrowPos = [
        msg.pos[0] + (arrowDist / distance) * (toPos[0] - fromPos[0]),
        msg.pos[1] + (arrowDist / distance) * (toPos[1] - fromPos[1]),
      ]; 
      const arrowSidePos = [
        msg.pos[0] + (options.messageRadius / distance) * (fromPos[0] - toPos[0]),
        msg.pos[1] + (options.messageRadius / distance) * (fromPos[1] - toPos[1]),
      ];
      const rotate = (v, alpha) => ([
        (Math.cos(alpha) * v[0] - Math.sin(alpha) * v[1]),
        (Math.sin(alpha) * v[0] + Math.cos(alpha) * v[1])
      ]);
      const transform = (v, alpha) => {
        let temp = [v[0] - msg.pos[0], v[1] - msg.pos[1]];
        temp = rotate(temp, alpha);
        return [temp[0] + msg.pos[0], temp[1] + msg.pos[1]];
      }
      const arrowSidePos1 = transform(arrowSidePos, Math.PI / 2 + 0.5);
      const arrowSidePos2 = transform(arrowSidePos, -Math.PI / 2 - 0.5);
      context.fillStyle = COLORS.messageOutline;
      context.strokeStyle = COLORS.messageOutline;
      context.moveTo(...arrowSidePos1);
      context.lineTo(...arrowPos);
      context.lineTo(...arrowSidePos2);
      context.stroke();
      context.fill();
      context.closePath();
    
      // Actual Circle
      context.beginPath();
      context.lineWidth = 2;
      context.strokeStyle = COLORS.messageOutline;
      context.fillStyle = COLORS.messageFill;
      context.arc(msg.pos[0], msg.pos[1], options.messageRadius, 0, 2 * Math.PI);
      context.stroke();
      context.fill();
      if (context.isPointInPath(mouseCursor.position[0], mouseCursor.position[1])) {
        context.canvas.style.setProperty("cursor", "pointer", "important");
        mouseCursor.hits.map(el => el.id).indexOf(msg.id) === -1 && mouseCursor.hits.push(msg);
      }
      context.closePath();
    });
  state.nodes
    .filter(n => n && n.pos && n.id)
    .forEach(n => {
      // Circle
      context.beginPath();
      context.lineWidth = 5;
      context.fillStyle = "#ADD495";
      context.strokeStyle = "#80B7A2";
      if (!n.connected) {
        context.fillStyle = "#DDD";
        context.strokeStyle = "#AAA";
      } else if (options.isLeader(n)) {
        context.fillStyle = "#EE2"
        context.strokeStyle = "#DD0";
      }
      context.arc(n.pos[0], n.pos[1], options.nodeRadius, 0, 2 * Math.PI);
      context.stroke();
      maxWidth = Math.max(maxWidth, n.pos[0]);
      maxHeight = Math.max(maxHeight, n.pos[1]);
      context.fill();
      if (context.isPointInPath(mouseCursor.position[0], mouseCursor.position[1])) {
        context.canvas.style.setProperty("cursor", "pointer", "important");
        mouseCursor.hits.map(n => n.id).indexOf(n.id) === -1 && mouseCursor.hits.push(n);
      }
      context.closePath();

      // Inner Text
      options.paintNodeText(context, n);
      context.beginPath();
      context.fillStyle = "#FFF";
      if (!n.connected) {
        context.fillStyle = "#000";
      } else if (options.isLeader(n)) {
        context.fillStyle = "#000"
      }
      context.font = "bold 20px courier new";
      context.fillText(n.id, n.pos[0] - 12, n.pos[1] + 5);
      context.closePath();
    });

  // Selected highlighting
  if (state.selectedElementId) {
    state.nodes
      .filter(n => n.id === state.selectedElementId)
      .forEach(n => {
        context.beginPath();
        context.strokeStyle = "#F497A4";
        context.lineWidth = 5
        context.arc(n.pos[0], n.pos[1], options.nodeRadius + 5, 0, 2 * Math.PI);
        context.stroke();
        context.closePath();
      });
  }
  context.restore();
  if (import.meta.env.DEV && mouseCursor && mouseCursor.position) {
    context.beginPath();
    context.fillStyle = "#FF0000";
    context.fillRect(mouseCursor.position[0], mouseCursor.position[1], 10, 10);
    context.closePath();
  }
  return [maxWidth, maxHeight];
}
