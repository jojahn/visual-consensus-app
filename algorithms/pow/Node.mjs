import { genesisBlock } from "./genesisBlock.mjs";
import { SimulatedNode } from "../../simulation/SimulatedNode.ts/index.js";
import { hash, verify } from "../../utils/hashing.mjs";

const MAX_MINING = 5000;
const MIN_MINING = 1000;

export class Node extends SimulatedNode {
  constructor(id, config, state, network) {
    super(id, config, state, network);
    this.type = "node";
    this.state.text = "IDLE";
    this.state.chain = [genesisBlock];
    this.state.mempool = [];
    this.getBlocks();
  }

  onmessage(msg) {
    switch(msg.command) {
    case "getblocks":
      super.invoke(this.onGetBlocks(msg));
      break;
    /* case "inv":
      super.invoke(this.onInv(msg));
      break;
    case "getdata":
      super.invoke(this.onGetData(msg));
      break; */
    case "REQUEST":
      super.invokeDo(this.sendRawTransaction(msg));
      break;
    case "blocks":
      super.invoke(this.onBlocks(msg));
      break;
    case "rawtransaction":
      super.invokeDo(this.onRawTransaction(msg));
      break;
    case "submitblock":
      super.invokeDo(this.onSubmitBlock(msg));
      break;
    }
  }

  onBlocks(msg) {
    return {
      do: async () => {
        for (let b of msg.entries) {
          const hashMatch = await verify(b.header.prevHeaderHash, this.state.chain.at(-1).header);
          if (!hashMatch){
            // TODO: How do we get a better chain? [Restart getBlocks with another node?]
            return;
          }
          this.state.chain.push(b);
        }
      },
      undo: () => undefined
    }

  }

  /* onInv(msg) {
    return {
      do: () => {
        this.network.sendTo(msg.fromId, {
          command: "getdata",
          entries: msg.entries
        });
      },
      undo: () => undefined
    };
  } */

  /* onGetData(msg) {
    return {
      do: () => {
        this.network.sendTo(msg.fromId, {
          command: "blocks",
          entries: this.chain
        });
      },
      undo: () => undefined
    }
  } */

  // TODO: Replace abstraction
  onGetBlocks(msg) {
    return {
      do: () => {
        this.network.sendTo(msg.fromId, {
          command: "blocks",
          entries: this.state.chain
        });
        /* let match = {};
        this.chain.forEach((b, idx) => {
          if (b.hash === msg.headerHashes[0]) {
            match.b = b;
            match.idx = idx
          }
        });
        if (!match.b) {
          this.network.sendTo(msg.fromId, {
            command: "inv",
            entries: this.chain.slice(1, this.chain.length)
          });
          return;
        }
        // const entries = this.chain.slice(match.idx, match.idx + 500);
        this.network.sendTo(msg.fromId, {
          command: "inv",
          entries: this.chain
        }); */
      },
      undo: () => undefined
    }

  }

  getBlocks() {
    if (this.network.neighbors.length === 0) {
      return;
    }
    const nodeNeighbors = this.network.getNeighborsOfType("node");
    if (nodeNeighbors.length === 0) {
      return;
    }
    const randomIdx = Math.floor(Math.random() * nodeNeighbors.length);
    const syncNode = nodeNeighbors[randomIdx];
    this.network.sendTo(syncNode.id, {
      command: "getblocks",
      headerHashes: [this.state.chain.at(-1).hash],
      // stoppingHash: 0b0
    });
  }

  sendRawTransaction(msg) {
    return () => {
      const txInMempool = this.state.mempool.find(tx => msg.tx === tx);
      const txInChain = this.state.chain.find(b => b.transactions.find(tx => tx === msg.tx));
      if (!txInMempool && !txInChain) {
        if (this.timeout) {
          clearTimeout(this.timeout);
        }
        const randomTimeout = (Math.random() * (MAX_MINING - MIN_MINING)) + MIN_MINING;
        // TODO: Use global timeout for performance with 100+ Nodes
        this.timeout = setTimeout(this.tryMining(), randomTimeout);

        this.state.mempool.push(msg.tx);
        this.network.broadcastToType({
          timestamp: msg.timestamp,
          tx: msg.tx,
          command: "rawtransaction"
        }, "node");
      }
    }
  }

  onRawTransaction(msg) {
    return () => {
      this.sendRawTransaction(msg)();
    };
  }

  onSubmitBlock(msg) {
    return () => {
      // TODO: Validate Block and Order of Blocks
      const txnsEqual = (a, b) =>
        () => a.transactions.filter((t, i) => t !== b.transactions[i]).length === 0
      const duplicate = this.state.chain.find(b => b === msg.block
        || txnsEqual(msg.block, b));
      if (!duplicate) {
        console.log("--> NO DUPLICATE: chain = ", this.state.chain, ", new block = ", msg.block)
        this.state.mempool = this.state.mempool
          .filter(tx => !msg.block.transactions.find(t => t !== tx));
        this.state.chain.push(msg.block);
      }
    }
  }

  stop() {
    super.stop();
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  restart() {
    super.restart();
    const randomTimeout = (Math.random() * (MAX_MINING - MIN_MINING)) + MIN_MINING;
    // TODO: Use global timeout for performance with 100+ Nodes
    this.timeout = setTimeout(this.tryMining(), randomTimeout);
  }

  tryMining() {
    return async () => {
      if (this.state.mempool.length === 0) {
        return;
      }
      const nonce = Math.random().toFixed(8);
      const prevHeaderHash = await hash(this.state.chain.at(-1), nonce);
      const block = {
        header: {
          prevHeaderHash,
          merkleRoot: null,
          nonce
        },
        height: this.state.chain.length,
        timestamp: new Date().getTime(),
        transactions: this.state.mempool
      };
      this.state.mempool = [];
      this.state.chain.push(block);
      this.network.broadcastToType({
        block,
        command: "submitblock"
      }, "node");
    };
  }

  validate(b) {
    return verify(b.header.prevHeaderHash, { ...b, hash: undefined });
  }
}