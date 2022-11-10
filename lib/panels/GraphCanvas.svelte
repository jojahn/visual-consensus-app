<script>
import {readable, writable} from "svelte/store";

import {onMount, onDestroy, afterUpdate} from 'svelte';

import { paintNodeGraph } from "../../drawing/paintNodeGraph.mjs";
import { canvas2DGraph } from "../../drawing/canvas2DGraph.mjs";

export let id;
export let configStore;
export let stateStore;
export let paintFn = paintNodeGraph;
export let minWidth = 100;
export let minHeight = 100;

export let paintOptions = undefined;

export let onElementSelected = (_) => undefined;
export let onElementHovered = (_) => undefined;
export let onElementHoverEnd = () => undefined;

let hoveredElement = writable(undefined);
const onHover = (element) => {
    hoveredElement.update(_ => element);
    onElementHovered(element);
}
const onHoverEnd = () => {
    hoveredElement.set(undefined);
    onElementHoverEnd();
}

function onClick(element) {
    stateStore.update(s => ({ ...s, selectedElementId: element.id }));
    onElementSelected(element);
    hoveredElement.set(undefined);
}

let graph = null;
let canvas = null;

let offsetX, offsetY = 50;

let fps = 0;

let hasControl = true;
function toggleHasControl() {
    hasControl = !hasControl;
    graph && graph.setLock(!hasControl);
}

let ctrlPressed = false;
function setCtrlPressed(event) {
    if (event.keyCode === 17)
        ctrlPressed = true;
}
function unsetCtrlPressed(event) {
    if (event.keyCode === 17)
        ctrlPressed = false;
}

const updateState = (updater) => stateStore.update(updater);
const createGraph = () => {
    graph && graph.remove();
    graph = canvas2DGraph(
        canvas,
        $configStore,
        { subscribe: (listener) => stateStore.subscribe(listener) },
        paintFn,
        paintOptions,
        { onHover, onHoverEnd, onClick, updateState }
    );
    panOffset = [canvas.width / 5, canvas.height / 5];
    graph.pan(panOffset);
}

function onWindowResize() {
    const canvas = document.getElementById(id);
    const wrapper = canvas.parentElement;
    if (canvas && wrapper) {
      canvas.height = Math.max(minHeight, wrapper.clientHeight);
        canvas.width = Math.max(minWidth, wrapper.clientWidth);
    }
}

let moving = false;
function onMouseDown() {
    if (!hasControl || !ctrlPressed) {
        return;
    }
    moving = true;
}
function onMouseUp() {
    moving = false;
}
let panOffset = [0, 0];
function onMouseMove(event) {
    if (moving && hasControl && ctrlPressed) {
        const scale = 1/zoomScale;
        panOffset = [
            (panOffset[0] + scale * event.movementX),
            paintOptions.autoAlign === "TOP_TO_BOTTOM" ? 0
              : (panOffset[1] + scale * event.movementY)];
        graph.pan(panOffset);
    }
}
function onMouseLeave() {
    moving = false;
}
function resetControls() {
    zoomScale = 1.0;
    graph.zoom(zoomScale);

    panOffset = [0, 0];
    graph.pan(panOffset);
}

const MIN_ZOOM_SCALE = 0.5;
const MAX_ZOOM_SCALE = 2.0;
let zoomScale = 1.0;
function onScroll(event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
}
function onCanvasWheel(event) {
    if (!hasControl || !ctrlPressed) {
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    changeZoomScale(event.deltaY * -0.001);
}

function changeZoomScale(diff) {
  zoomScale = Math.round(
    Math.min(
      Math.max(MIN_ZOOM_SCALE, zoomScale + diff),
      MAX_ZOOM_SCALE
    ) * 10) / 10;
  graph.zoom(zoomScale);
}

onMount(() => {
    const canvas = document.getElementById(id);
    offsetX = canvas.offsetLeft;
    offsetY = canvas.offsetTop;
    canvas.addEventListener("wheel", onCanvasWheel, {passive: false});
    window.addEventListener("scroll", onScroll, false);
    window.addEventListener("resize", onWindowResize, true);
    document.addEventListener("keydown", setCtrlPressed);
    document.addEventListener("keyup", unsetCtrlPressed);
    configStore.subscribe(createGraph);
  // Temporary Fix: matches canvas dimensions with canvas.parentElement;
  onWindowResize();
});

let currentPaintOptions = paintOptions;
afterUpdate(() => {
    if (currentPaintOptions !== paintOptions) {
        createGraph();
        currentPaintOptions = paintOptions;
    }
});

let interval = setInterval(() => {
    fps = graph.debugInfo.fps;
}, 500);

onDestroy(() => {
    window.removeEventListener("resize", onWindowResize);
    canvas.removeEventListener("wheel", onCanvasWheel);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("keydown", setCtrlPressed);
    document.removeEventListener("keyup", unsetCtrlPressed);
    graph && graph.remove();
    interval && clearInterval(interval);
});

// TODO: Remove blocked mouse cursor while moving
function onDrop(event) {}
function onDragOver(event) {}

</script>

<div class="canvas-wrapper" on:drop="{onDrop}" on:dragover="{onDragOver}">

    <div class="controls-section">
        {#if import.meta.env.DEV}
            <p class="fps-counter-badge">{fps} fps</p>
        {:else}
            <p></p>
        {/if}
        <button on:click={toggleHasControl}>
            {#if hasControl}
                <span>lock</span>
            {:else}
                <span>unlock</span>
            {/if}
        </button>
        <button on:click={resetControls}>Reset</button>
        <div class="zoom">
            <button on:click={() => changeZoomScale(-0.1)}>-</button>
            <p>{zoomScale}x</p>
            <button on:click={() => changeZoomScale(0.1)}>+</button>
        </div>
    </div>

    <canvas
            class="{$stateStore.hoveredElement ? 'clickable'
                : (moving ? 'moving'
                : (hasControl && ctrlPressed ? 'movable'
                : ''))}"
            bind:this={canvas}
            id="{id}"
            width="640"
            height="480"
            on:mousemove={onMouseMove}
            on:mousedown={onMouseDown}
            on:mouseup={onMouseUp}
            on:mouseleave={onMouseLeave}
    ></canvas>
    <slot name="hover" hoveredElement={hoveredElement} offsetX={offsetX} offsetY="{offsetY}"></slot>
</div>
<div class="help">
    <span>Pan: <kbd>LeftCtrl</kbd> + Hold <kbd>MouseLeft</kbd></span>
    <span>Zoom: <kbd>LeftCtrl</kbd> + <kbd>MouseWheel</kbd></span>
</div>

<style>
    .canvas-wrapper .controls-section {
        margin: 10px;
        position: absolute;
        padding: 2px 8px;
        display: flex;
    }

    .controls-section .zoom {
        display: flex;
        user-select: none;
    }

    .help {
        /* position: absolute; */
        padding: 2px 8px;
        margin-top: -30px;
        font-size: 0.6rem;
        display: flex;
        flex-direction: column;
        user-select: none;
        width: max-content;
    }

    .canvas-wrapper .controls-section p:not(.fps-counter-badge) {
        margin: 0;
        padding: 0;
    }

    .fps-counter-badge {
        width: max-content;
        background-color: #0072ff;
        padding: 2px 8px;
        border-radius: 5rem;
        color: white;
        margin: 0;
    }

    .canvas-wrapper {
        border: 1px solid #eee;
        border-radius: 0.3rem;
        padding: 0;
        overflow: hidden; /* or auto */
        max-height: 100vh;
        min-height: 200px;
        height: calc(100% - 30px);
    }

    .canvas-wrapper canvas {
        min-width: 100px;
        min-height: 100px;
        margin-top: 20px;
        cursor: default !important;
    }

    canvas.movable {
        cursor: grab !important;
    }

    canvas.moving {
        cursor: grabbing !important;
    }

    canvas.clickable {
        cursor: pointer !important;
    }
</style>
