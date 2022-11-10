import { defaultConfig } from "../utils/defaultConfig.mjs";
import startSimulation, { UpdateableValue } from "../simulation/index";
import { defaultConfig as defaultPaxosConfig, generateState as generatePaxosState } from "../algorithms/paxos/index.mjs";
import { writable } from "svelte/store";
import algorithmModules from "../algorithms/index.mjs";

declare const window: any;

export function setupAlgorithmStores(algorithm = algorithmModules["paxos"]) {
  // Initial algorithm setup
  // Setup config store and config object
  // Changes to the initialConfig object outside this component don't update bindings!
  // TODO: split generic and algorithm-specific config options
  let initialConfig = { ...defaultConfig };
  initialConfig = {
    ...initialConfig,
    ...(algorithm && algorithm.defaultConfig
      ? algorithm.defaultConfig
      : defaultPaxosConfig)
  };
  const configStore = writable(initialConfig);
  configStore.subscribe(c => {
    // The initialConfig object gets updated if the store get updated
    initialConfig = c;
    if (import.meta.env.DEV) {
      window.config = c;
    }
  });

  // Setup state store and config object
  const generateStateFn = algorithm && algorithm.generateState
    ? algorithm.generateState
    : generatePaxosState;
    // The same object/store principal as the config applies here
  const stateStore = writable(generateStateFn(initialConfig));
  stateStore.subscribe(s => {
    if (import.meta.env.DEV) {
      window.state = s;
    }
  });

  const controlsStore = writable(null);
  controlsStore.subscribe(c => {
    if (import.meta.env.DEV) {
      window.controls = c;
    }
  });
  const configure = buildConfigure(algorithm, initialConfig, stateStore, controlsStore, configStore);
  configStore.subscribe(configure);
  configure(initialConfig);
  return [ configStore, stateStore, controlsStore ];
}

function buildConfigure(algorithm, initialConfig, stateStore, controlsStore, configStore) {
  let currentConfig = null;
  return (config) => {
    // Don't trigger simulation reset if algorithm and threading stays the same
    if (currentConfig && (currentConfig.key === config.algorithm && currentConfig.useWorkers === config.useWorkers)) {
      currentConfig = config;
      return config;
    }
    currentConfig = config;

    // Get new default config
    if (algorithm.key !== config.algorithm) {
      algorithm = algorithmModules[config.algorithm];
      if (!algorithm) {
        console.error("algorithm not supported");
      }
      const currentDefaultConfig = {};
      Object.keys(defaultConfig).forEach(key => {
        currentDefaultConfig[key] = config[key];
      });
      config = { ...currentDefaultConfig, ...algorithm.defaultConfig };
    }

    // Stop current simulation
    /* controlsStore.update(controls => {
            controls.simulation && controls.simulation.terminate();
            return null;
        }) */

    resetAlgorithmState(algorithm, config, stateStore, controlsStore, configStore);
    return config;
  }
}

function resetAlgorithmState(algorithm, config, stateStore, controlsStore, configStore) {
  // call itself on reset
  const buildReset = () => () => {
    return resetAlgorithmState(algorithm, config, stateStore, controlsStore, configStore);
  }

  // Update state
  const generateStateFn = algorithm.generateState;
  const currentState = generateStateFn(config);
  stateStore.update(() => currentState);

  // Setup simulation (runners, controls)
  // uses lang and recent generated state since the store update is too slow
  const [runners, updatedControls] = startSimulation(
    toUpdateableValue(config, configStore),
    toUpdateableValue(currentState, stateStore),
    buildReset()
  );
  controlsStore.update((currentControls) => {
    if (currentControls && currentControls.simulation) {
      currentControls.simulation.terminate();
    }
    return updatedControls;
  });
  if (import.meta.env.DEV) {
    window.runners = runners;
    window.controls = updatedControls;
  }
  return currentState;
}

function toUpdateableValue(initial, store): UpdateableValue {
  let value = initial;
  store.subscribe(v => value = v);
  return {
    value,
    update: store.update
  }
}