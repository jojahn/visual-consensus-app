import { Network } from "./Network";

export class WorkerNetwork extends Network {
  constructor(node, neighbors) {
    super(node, neighbors)
  }

  emit(data) {
    self.postMessage(data);
  }

  listen() {
    import.meta.env.DEV && console.error("Listen is not supported in workers");
    return () => undefined;
  }
}
