export const labels = {
  name: "Paxos",
  description: "Paxos is a consensus algorithm.",
  original: "http://lamport.azurewebsites.net/pubs/lamport-paxos.pdf",
  areas: ["Distributed Databases"],
  applications: [{ title: "AzureRSL", src: "" }],
  info: {
    byNodeType: {
      leader: "A leader primarily has the role of the proposer.",
      follower: "A follower primarily has the role of the acceptor.",
      node: "A paxos Node follows all three roles of the paxos protocol.",
      proposer: "A proposer tries to have the acceptors agree on a value v send by a client.",
      acceptor: "An acceptor votes on proposals sent from the proposer. Only then a value can be stored",
      learner: "A learner makes sure an accepted value is stored and distributed.",
      client: "Clients want to store data or run actions inside the paxos network. The client is most likely another server system."
    },
    byNodeState: {
    },
    byMessageMethod: {
      REQUEST: "Clients can send requests to the current leader if they want to store an input to the replicated log of the cluster.",
      PREPARE: "A leader node (or proposer) sends followers its generation n. It prepares to commit a value v.",
      PROMISE: "Followers (or acceptors) answer to the PREPARE requests with a PROMISE message",
      ACCEPT: "After getting all promises from the acceptor the proposer wants all acceptors to accept a value v",
      ACCEPTED: "If an acceptor accepts a value v it sends an ACCEPTED message back to the proposer",
      IGNORED: "If an acceptor does not accept a value v it sends an IGNORED message back to the proposer. The proposer must try again with a higher generation"
    },
  }
}