export const defaultConfig = {
  algorithm: "paxos",
  // delay for commands of nodes (milliseconds)
  commandDelay: 0,
  // delay for transmission of messages to other nodes (milliseconds)
  networkDelay: 5000,
  // speed factor of the entire simulation
  speed: 1,
  // Use multithreading for nodes
  useWorkers: true,
  useGlobalState: false
}