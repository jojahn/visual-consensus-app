export const defaultConfig = {
  algorithm: "paxos",
  commandDelay: {
    title: "Command delay",
    description: "Delay for commands of nodes (milliseconds)",
    type: "number",
    min: 0,
    max: 60000,
    default: 0
  },
  networkDelay: {
    title: "Network delay",
    description: "delay for transmission of messages to other nodes (milliseconds)",
    type: "number",
    min: 0,
    max: 60000,
    default: 5000
  },
  // speed factor of the entire simulation
  speed: 1,
  useWorkers: {
    title: "Use workers",
    description: "Use multithreading for nodes",
    type: "boolean",
    default: true
  }
}