/* const HIDDEN_PROPERTIES = [
  "executedCommands",
  "scheduledCommands",
  "state"
]; */

import { randomId } from "../utils/randomId.mjs";

export class SimulatedNode {
  public id;
  public config;
  public state;
  public network;
  public running;
  public connected;
  public executedCommands;
  public scheduledCommands;
  
  constructor(id, config, state, network) {
    this.id = id;
    this.config = config;
    this.state = state;
    this.network = network;
    this.running = true;
    this.connected = true;

    this.executedCommands = [];
    this.scheduledCommands = [];
  }

  stop() {
    this.running = false;
  }
  restart() {
    this.running = true;
    this.scheduledCommands.forEach(cmd => {
      cmd.do();
      this.executedCommands.push(cmd);
    })
  }
  reconnect() { this.connected = true; }
  disconnect() { this.connected = false; }

  invoke(arg) {
    const id = randomId();
    let command = arg;
    if (typeof command === "function") {
      command = {
        id,
        do: arg,
        undo: () => console.warn("Undo not implemented")
      }
    } else {
      command.id = id;
    }
    if (this.running) {
      // TODO: use config.commandDelay
      command.do();
      this.executedCommands.push(command);
    } else {
      this.scheduledCommands.push(command);
    }
    this.updateState();
  }

  step(forward = true) {
    if (forward && this.scheduledCommands.length > 0) {
      const command = this.scheduledCommands.shift();
      command.do();
      this.executedCommands.push(command);
    } else if (this.executedCommands.length > 0) {
      const command = this.executedCommands.pop();
      command.undo();
      this.scheduledCommands.push(command);
    }
    this.updateState();
  }

  invokeDo(doFn) {
    const lastState = { ...this.state };
    const command = {
      do: () => {
        doFn();
      },
      undo: () => {
        this.state = lastState;
      }
    }
    this.invoke(command);
  }

  updateState() {
    // let data = {};
    /* Object.getOwnPropertyNames(this)
      .filter(name => HIDDEN_PROPERTIES.indexOf(name) !== -1)
      .map(name => {
        data[name] = this[name];
      });
    */
    this.network.sendTo(undefined, {
      type: "STATE_CHANGED",
      isFlow: true,
      data: {
        ...this.state,
        scheduledCommands: this.scheduledCommands.map(({ id }) => ({ id })),
        executedCommands: this.executedCommands.map(({ id }) => ({ id }))
      }
    });
  }
}