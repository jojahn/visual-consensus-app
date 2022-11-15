# Documentation

## Adding a new algorithm

*Algorithms can be written in JavaScript, TypeScript or Both
(file endings: **.js**, **.mjs**, **.ts**)* 

Example file structure:
```
└───algorithms
     └───<name>
          ├───config
          │     ├───generateState.ts            
          │     └───defaultConfig.ts
          ├───components
          │     ├───StateGraph.svelte     
          │     ├───Configuration.svelte          
          │     └───Actions.svelte
          ├───drawing
          │     ├───nodePaintingOptions.ts            
          │     └───seqPaintingOptions.ts
          ├───index.ts
          ├───setupNode.ts
          └─── ...
```

New Algorithms must implement the following interface
that must imported into `/algorithms/index.mjs`. The function `setupNode` must also be imported into `/algorithms/setupNode.mjs`
```typescript
export interface Algorithm {
  key: string;
  title: string;
  setupNode: <T extends SimulatedNode, R extends NodeState>(
    config: any,
    state: any,
    internalState: R,
    network: Network
  ) => T;
  defaultConfig: any;
  generateState: (any) => AlgorithmState;
  drawing: {
    nodePaintingOptions?: any;
    seqPaintingOptions?: any;
  }
  components: {
    Actions: SvelteComponent;
    Configuration: SvelteComponent;
    StateGraph: SvelteComponent;
  };
}
```

### 0. Implement algorithm

*Check out Documentation from:*
 * HTML,CSS,JavaScript: [https://developer.mozilla.org](https://developer.mozilla.org)
 * TypeScript: [TypeScript docs](https://www.typescriptlang.org/docs/)
 * Svelte: [Svelte docs](https://svelte.dev/doc), [Svelte interactive tutorial](https://svelte.dev/tutorial/basics)
 * Jest: [Jest docs](https://jestjs.io/docs/getting-started)

Interfaces for Theming, Colors, Localization and Custom Rendering are planned for a future release.

An actual node must be implemented as a class and inherit from `SimulatedNode`. 
Communication between nodes is async and runs over the `onmessage` callback. 
Inside each call of `onmessage`, `invoke` must be called to allow step-by-step controls. 

```ts
interface Command {
  do(): void;
  undo(): void;
}

abstract class SimulatedNode {
  abstract onmessage<T extends Message>(msg: T)
  invoke(command: Command) { /* ... */ }
}
```

```ts
class Node extends SimulatedNode {  
  onmessage<T extends Message>(msg: T) {
    this.invoke(handler(msg));
  }

  handler(msg): Command {
    return {
      do: () => {
        /* ... */
      },
      undo: () => {
        /* ... */
      }
    }
  }
}
```

### 1. Implement required interfaces

#### Configuration and State

Add default configuration json object in `config/defaultConfig.ts`:
```typescript
export const defaultConfig = {
  /* ... */
};
```

Add function that generates a state from a config object in `config/generateState.ts`:
```typescript
export function generateState(config) {
  /* ... */
  const nodes, messages = [];
  for (let i = 0; i < config.numberOfNodes; i++) {
    nodes.push({
      /* ... */
    })
  }
  /* ... */
};
```

Use `distributeNodes` to create a circle of nodes: 
```typescript
function distributeNodes(numberOfNodes: number, radius: number) { /* ... */ }
```

The return value of `generateState` must have these properties: 
```typescript
interface AlgorithmState {
  selectedElementId: undefined,
  started: string,
  speed: number,
  nodes: NodeState[],
  messages: Message[]
}
```
Nodes inside the state must be objects (for transfer between workers) with the following properties: 
```typescript
interface NodeState {
  id: string;
  pos: [number, number];
  type: string,
  running: boolean,
  connected: boolean,
  state: string
}
```
Messages must have at least these properties:
```typescript
interface Message {
  id: string;
  fromId: string;
  toId: string;
  sent: string;
}
```

Add Svelte component for editing the configuration json object in `components/Configuration.svelte`:
```html
<script>
  export let config;
</script>

<input bind:value={$config.customValue}>
```

#### Node class instantiation

Create a function that creates a node from the config/state in `setupNode.ts`:
```ts
function setupNode<T extends SimulatedNode>(
  config,
  state,
  nodeState,
  network
 ): T
{ /* ... */ }
```

#### Create algorithm display components

Add a svelte component for viewing and modifying elements (messages, nodes) in `components/Actions.svelte`:
```html
<script>
    export let element;
    export let actions;
</script>

<!-- ... -->
```

Use `actions.createNewAction` to add custom interactions, like this:
```ts
function customActionBlueprint(config, state, runners) {
  /* ... */
}
const customAction = actions.createNewAction(customActionBlueprint);
```

Add a svelte component for displaying the state in `components/StateGraph.svelte`:
```html
<script>
    export let configStore;
    export let stateStore;
</script>

<!-- ... -->
```

Drawing of the nodegraph and sequence diagram is handled by platform.
Options can be added in `drawing/nodePaintingOptions.ts` and `drawing/seqPaintingOptions.ts`. 
All properties are found in the painting function under `/drawing/`, also the custom options can be partial.

For the sequence diagram create at least a function for step texts in `drawing/seqPaintingOptions.ts`:
```typescript
export const seqPaintingOptions = {
  getText: (msg) => msg.type
}
```

### 2. Create and integrate module

Create a module in `/algorithms/<name>/index.[mjs|ts]` that exports all previously created functions, components, constants:
```ts
// unique short key for internal identification
export const key = "<name>";
// Long title for display in navigation
export const title = "<Name>";

export * from "./setupNode.mjs";
export * from "./config/generateState.mjs"
export * from "./config/defaultConfig.mjs"

// Painting Options
import { seqPaintingOptions } from "./drawing/seqPaintingOptions.mjs";
import { nodePaintingOptions } from "./drawing/nodePaintingOptions.mjs";
export const drawing = {
  seqPaintingOptions,
  nodePaintingOptions,
};

// UI Components
import { default as Configuration } from "./components/Configuration.svelte";
import { default as Actions } from "./components/Actions.svelte";
import { default as StateGraph } from "./components/StateGraph.svelte";
export const components = {
  Configuration,
  Actions,
  StateGraph
};
```

Add the new algorithm module to `/algorithms/index.mjs`:
```typescript
import * as customAlgorithm from "<name>";
export default algorithms = [
  /* ... */
  customAlgorithm
] 
```

Add the new `setupNode` function to `/algorithms/setupNode.mjs`:
```typescript
import { setupNode as setupCustomNode } from "<name>";

export function setupNode(key, ...args) {
  switch (key) {
    /* ... */
    case "<name>":
      return setupCustomNode(...args);
    /* ... */
  }
}
```