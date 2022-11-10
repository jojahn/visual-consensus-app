export const labels = {
  info: {
    byNodeType: {
      node: `Nodes accept, save and relay new transactions/blocks.
            A Node can also create Blocks with saved blocks.
            Nodes joins the Network and asks for the current blockchain.`,
      client: `A client uses a node to request a transaction to be saved on the blockchain.
      Clients can be outside of the P2P network. 
      They may use external providers that actually own nodes to send transactions.`
    },
    byNodeSync: {
      "true": "Sync nodes can send their blockchain to new nodes."
    },
    byMessageCommand: {
      "REQUEST": "Clients request transactions to be stored on the blockchain.",
      "getblocks": "New nodes bootstrap by asking sync nodes for their blockchain.",
      "blocks": "Sync nodes answer with their blocks to new nodes (getblocks).",
      "submitblock": "Nodes send new mined blocks to their neighbors.",
      "rawtransaction": "Nodes relay transactions to their neighbors."
    }
  }
}