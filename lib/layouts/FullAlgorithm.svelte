<script>
    import { onMount } from 'svelte';

    import Configuration from "../panels/Configuration.svelte";

    import GraphCanvas from "../panels/GraphCanvas.svelte";
    import AnimControls from "../controls/AnimControls.svelte";
    import { paintSequenceDiagram } from "../../drawing/paintSequenceDiagram.mjs";
    import { paintNodeGraph } from "../../drawing/paintNodeGraph.mjs";
    import ElementActions from "../controls/ElementActions.svelte";
    import ElementHoverInfo from "../controls/ElementHoverInfo.svelte";

    export let stateStore;
    export let configStore;
    export let controlsStore;
    export let algorithm;
    export let algorithms;

    let selectedElementActions = {};
    let selectedElementId = undefined;
    let graphCanvasProps = {
        stateStore,
        configStore
    }

    let AlgorithmConfiguration = algorithm.components.Configuration;
    let Actions = algorithm.components.Actions;
    let paintStateFn = algorithm.drawing.paintState;
    let seqPaintingOptions = algorithm.drawing.seqPaintingOptions || {};
    let nodePaintingOptions = algorithm.drawing.nodePaintingOptions || {};
    let StateGraph = algorithm.components.StateGraph;

    let selectedElement = null;

    onMount(() => {
        configStore.subscribe(c => {
            let a = algorithms[c.algorithm];
            AlgorithmConfiguration = a.components.Configuration;
            StateGraph = a.components.StateGraph;
            Actions = a.components.Actions;
            paintStateFn = a.drawing.paintState;
            seqPaintingOptions = a.drawing.seqPaintingOptions ? { ...a.drawing.seqPaintingOptions } : {};
            seqPaintingOptions.autoAlign = "TOP_TO_BOTTOM";
            nodePaintingOptions = a.drawing.nodePaintingOptions ? { ...a.drawing.nodePaintingOptions } : {};
            nodePaintingOptions.autoAlign = "CENTER";
        });
        stateStore.subscribe(updated => {
            if (!$controlsStore || !updated) {
                return;
            }
            // selected element changed
            if (selectedElementId !== updated.selectedElementId) {
                selectedElementId = updated.selectedElementId;
            }

            // update local selected element
            if (selectedElementId && selectedElementId.indexOf && selectedElementId.indexOf("M_") === 0) {
                selectedElement = $stateStore.messages.find(m => m.id === selectedElementId);
            } else {
                selectedElement = $stateStore.nodes.find(n => n.id === selectedElementId);
            }

            // update actions for local selected element
            if (selectedElement) {
                selectedElementActions = $controlsStore.element(
                    updated.nodes.find(n => n.id === selectedElementId)
                );   
            }
        });
        // TODO: move to setupAlgorithm.mjs
        stateStore.update(s => ({
            ...s,
            selectedElementId: s.nodes.filter(n => n.type === "client")[0]
        }));
        graphCanvasProps = {
            stateStore,
            configStore
        };
    });

</script>

<article class="full-algorithm">
    <!-- <section>
        <h1><a href="{algorithm.labels.original}">{algorithm.labels.name}</a></h1>
        <p>{algorithm.labels.description}</p>
    </section> -->
    <section class="canvas-section">
        <section class="raised graph-panel">
            <h1>Node Graph</h1>
            <GraphCanvas
                {...graphCanvasProps}
                id="Canvas_{$configStore.algorithm}_Nodes"
                paintFn="{paintNodeGraph}"
                let:hoveredElement={el}
                let:offsetY={y}
                let:offsetX={x}
                paintOptions={nodePaintingOptions}
            >
                <!-- <ElementHoverInfo
                    slot="hover"
                    offsetX="{x}"
                    offsetY={y}
                    hoveredElement={el}
                /> -->
            </GraphCanvas>
        </section>
        <section class="raised graph-panel">
            <h1>Sequence Diagram</h1>
            <GraphCanvas
                    {...graphCanvasProps}
                    id="Canvas_{$configStore.algorithm}_Sequence"
                    paintFn="{paintSequenceDiagram}"
                    paintOptions={seqPaintingOptions}
            />
        </section>
        <section class="raised actions-panel">
            <h1>Actions</h1>
            <svelte:component this={Actions}
                element="{selectedElement}"
                actions="{selectedElementActions}"
            />
        </section>
    </section>

    {#if paintStateFn || StateGraph}
        <section class="state-section">
            <h1>State</h1>
            {#if StateGraph}
                <svelte:component
                        this={StateGraph}
                        stateStore="{stateStore}"
                        configStore="{configStore}"
                />
            {:else if paintStateFn}
                <GraphCanvas
                        {...graphCanvasProps}
                        id="Canvas_{$configStore.algorithm}_State"
                        paintFn="{paintStateFn}"
                        paintOptions={{ autoAlign: "CENTER" }}
                />
            {/if}
        </section>
    {/if}

    <section class="controls-section">
        <AnimControls
                stateStore={stateStore}
                controls={$controlsStore && $controlsStore.simulation}
        />
    </section>

    <section class="config-section">
        <Configuration
                configStore={configStore}
                fullLayout={true}
                updateOnChange={true}
                algorithm="{algorithm}"
                let:config="{algorithmConfig}"
        >
            <svelte:component this={AlgorithmConfiguration} slot="algorithm-config" config="{algorithmConfig}"/>
        </Configuration>
    </section>
</article>

<style>
    .raised {
    }

    .actions-panel {
        width: calc(25% - 10px);
        margin: 10px;
        background-color: #f497a438;
        padding: 10px;
        overflow-x: auto;
        overflow-y: scroll;
    }

    h1 {
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 1rem;
    }

    .graph-panel {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        width: 37.5%;
        margin: 0 10px;
    }

    .full-algorithm {
        display: flex;
        flex-direction: column;
        max-width: 100vw;
        overflow-y: hidden;
        overflow-x: hidden;
    }
    
    .canvas-section {
        z-index: 9999;
        display: flex;
        justify-content: space-between;
        overflow: hidden;
        padding: 10px;
        min-height: 40vh;
        height: 40vh;
    }

    .config-section {
        color: #222;
        background-color: white;
        display: flex;
        justify-content: space-around;
    }

    .controls-section {
        background-color: #ddd;
    }

    .state-section {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        margin-bottom: 10px;
        height: 32vh;
        padding: 0 20px;
    }

    @media screen and (max-width: 680px) {
        .canvas-section {
            flex-direction: column;
            height: max-content;
        }

        .canvas-section > * {
            width: 100%;
            height: 100vh;
        }
    }
</style>