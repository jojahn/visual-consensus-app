export function distributeNodes(numberOfNodes, radius) {
  const positions = [];
  for (let i = 0; i < numberOfNodes; i++) {
    const alpha = 2 * Math.PI * ((i + 1)/numberOfNodes);
    positions.push([ radius * Math.cos(alpha) + radius, radius * Math.sin(alpha) + radius ]);
  }
  return positions;
}