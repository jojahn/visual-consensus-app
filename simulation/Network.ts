import { randomId } from "../utils/randomId.mjs";

export class Network {
  neighbors = [];
  node

  constructor(node, neighbors) {
    this.node = node;
    this.neighbors = neighbors && this.neighbors.concat(neighbors);
  }

  getAllNeighbors() {
    return this.neighbors;
  }
  getNeighborsOfType(type) {
    return this.neighbors.filter(n => n.type === type);
  }
  getRandomNeighborOfType(type) {
    const neighborsWithType = this.getNeighborsOfType(type);
    const idx = Math.floor(Math.random() * neighborsWithType.length);
    return neighborsWithType[idx];
  }

  broadcast(body, neighborIds) {
    const broadcastKey = randomId();
    const fromId = this.node.id;
    for (const toId of neighborIds) {
      if (toId !== fromId) {
        this.emit({
          ...body,
          sent: new Date().toISOString(),
          id: this.getRandomId(),
          broadcastKey,
          fromId,
          toId
        });
      }
    }
  }

  broadcastToAll(body) {
    const neighborIds = this.neighbors.map(n => n.id);
    this.broadcast(body, neighborIds);
  }

  broadcastToType(body, type) {
    const neighborIds = this.neighbors
      .filter(n => n.type === type)
      .map(n => n.id);
    this.broadcast(body, neighborIds);
  }

  sendTo(toId, body) {
    const fromId = this.node.id;
    // import.meta.env.DEV && console.log(`${fromId} -> ${toId}:`, body);
    this.emit({
      ...body,
      sent: new Date().toISOString(),
      fromId,
      toId,
      id: this.getRandomId()
    });
  }

  sendToSync(toId, body) {
    const fromId = this.node.id;
    return this.emitSync({
      ...body,
      sent: new Date().toISOString(),
      fromId,
      toId,
      id: this.getRandomId()
    });
  }

  emit(data) {
    window.dispatchEvent(new CustomEvent("NetworkEvent", { detail: { ...data, nodeId: this.node.id } }));
  }

  emitSync(data) {
    const resKey = randomId();
    return new Promise(resolve => {
      this.emit({ ...data, resKey });
      const stopListening = this.listen(response => {
        if (response.resKey === resKey) {
          stopListening();
          resolve(response);
        }
      });
    });
  }

  listen(callback) {
    const enrichCallback = (cb) =>
      event =>
        event.detail.toId === this.node.id && cb(event.detail);
    const wrappedCallback = enrichCallback(callback);
    window.addEventListener("NetworkEvent", wrappedCallback);
    return () => {
      window.removeEventListener("NetworkEvent", wrappedCallback);
    }
  }

  async receive() {
    return new Promise((resolve) => {
      this.listen(data => {
        resolve(data);
      });
    });
  }

  getRandomId() {
    return "M_" + randomId();
  }
}
