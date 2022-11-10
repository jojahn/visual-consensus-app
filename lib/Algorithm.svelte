<script>
    import {onDestroy, onMount} from 'svelte';

    import FullAlgorithm from "./layouts/FullAlgorithm.svelte";
    import { setupAlgorithmStores } from "./setupAlgorithmStores";
    import algorithms from "../algorithms/index.mjs";

    // Component Props
    export let layout = "full";
    export let registerAlgorithm;
    export let unregisterAlgorithm;

    const [configStore, stateStore, controlsStore] = setupAlgorithmStores();
    let algorithm, labels, controls;
    configStore.subscribe((config) => {
        algorithm = algorithms[config.algorithm];
        labels = algorithm.labels;
    });
    let currentState;
    stateStore.subscribe(updated => {
      if (!window.states) {
        window.stateIdx = -1;
        window.states = [];
      }
      const { nodes, messages } = updated;
      if (!currentState || currentState.nodes !== nodes || currentState.messages !== messages) {
        window.stateIdx += 1;
        window.states.push({ nodes, messages });
      }
    });
    controlsStore.subscribe((updatedControls) => {
        controls = updatedControls;
    });

    onMount(() => {
        registerAlgorithm && registerAlgorithm(configStore, stateStore);
    });

    onDestroy(() => {
        unregisterAlgorithm && unregisterAlgorithm(configStore, stateStore);
        controls && controls.simulation.terminate();
    });

    const layoutProps = {
        configStore,
        stateStore,
        controlsStore,
        algorithm,
        algorithms
    };
</script>

{#if layout === "full"}
<FullAlgorithm
        {...layoutProps}
/>
{:else}
    <span>Layout '{layout}' not supported</span>
{/if}
