<script>
import { get } from "svelte/store";
import Algorithm from "./Algorithm.svelte";
import Footer from "./Footer.svelte";
import Header from "./Header.svelte";
import { share, decodeConfigAndStateFromURL } from "../config/url.mjs";
import PerformanceGraph from "./components/PerformanceGraph.svelte";

let layout = "full";
let registeredAlgorithms = [];
let selectedAlgorithm = "paxos";
function onShareClicked() {
    if (layout !== "full") {
        return;
    }
    if (!registeredAlgorithms || !registeredAlgorithms[0]) {
        return;
    }
    const configStore = registeredAlgorithms[0].config;
    const stateStore = registeredAlgorithms[0].state;
    if (!configStore || !stateStore) {
        return;
    }
    let state = get(stateStore);
    let config = get(configStore);
    if (state && config) {
        share(config, state);
    }
}
function changeAlgorithm(algorithm) {
    if (layout !== "full") {
        return;
    }
    selectedAlgorithm = algorithm;
    registeredAlgorithms && registeredAlgorithms[0] && registeredAlgorithms[0].config
        .update((current) => ({
            ...current,
            algorithm
        }));
}
function registerAlgorithm(configStore, stateStore) {
    if (registeredAlgorithms.length === 0) {
        const {config, state} = decodeConfigAndStateFromURL();
        if (config) {
            configStore.set(config);
        }
        if (state) {
            stateStore.set(state);
        }
    }
    registeredAlgorithms.push({ config: configStore, state: stateStore });
}
function unregisterAlgorithm(configStore, stateStore) {
    registeredAlgorithms = registeredAlgorithms.filter(s => s.config !== configStore && s.state && stateStore);
}
</script>

<main>
    {#if import.meta.env.DEV}
        <PerformanceGraph algorithmStores={registeredAlgorithms} />
    {/if}
    <Header layout={layout}
            changeAlgorithm={changeAlgorithm}
            selectedAlgorithm={selectedAlgorithm}
            share={onShareClicked}
    />
    {#if layout === "full"}
        <Algorithm
                registerAlgorithm={registerAlgorithm}
                unregisterAlgorithm={unregisterAlgorithm}
                layout="{layout}"
        />
    {:else}
        <span>Layout not supported!</span>
    {/if}
    <Footer />
</main>

<style>
    :root {
        /* font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
        Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; */
        font-family: Helvetica Neue,Helvetica,Arial,sans-serif;
    }

    :global(body) {
        margin: 0;
        padding: 0;
    }
</style>