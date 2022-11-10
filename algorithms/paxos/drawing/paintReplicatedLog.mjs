import { COLORS } from "../../../drawing/colors";

export const paintingOptions = {
  padding: 2
};

export function paintReplicatedLog(context, state, mouseCursor, options = paintingOptions) {
  if (!state) {
    return [context.canvas.width, context.canvas.height];
  }

  let maxWidth = 0;
  let maxHeight = 0;
  options = { ...paintingOptions, ...options };
  state.nodes.forEach((n, idx) => {
    const yOffset = (20 + 10) * idx;

    context.beginPath();
    context.fillStyle = "#000";
    context.font = "20px courier new";
    let textPos = [0, yOffset + 12];
    context.fillText(n.id, ...textPos);
    context.closePath();

    let textOffset = n.id.length * 20 + paintingOptions.padding;
    n.proposer?.log && n.proposer.log
      .filter(i => i)
      .forEach(i => {
        context.beginPath();
        context.lineWidth = 2;
        context.strokeStyle = "#000";
        const w = i.length * 10;
        context.rect(textOffset - options.padding, yOffset, w + options.padding * 2, 10);
        context.stroke();
        context.closePath();

        context.beginPath();
        context.fillStyle = "#000";
        context.font = "12px courier new";
        let newOffset = textOffset + i.length * 12 + 2;
        let textPos = [newOffset, yOffset + 8];
        textOffset = newOffset;
        context.fillText(i, ...textPos);
        context.closePath();
      });
  });
  return [maxWidth, 30 * (state.nodes.length + 1)];
}