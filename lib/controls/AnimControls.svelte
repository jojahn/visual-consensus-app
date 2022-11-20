<script>
    import {onDestroy, onMount} from "svelte";

    export let stateStore;
    export let controls;

    let paused = false;

    const step = 0.25;
    let speed = 1 / step;
    const setSpeed = (event) => {
        try {
            speed = parseInt(event.target.value);
        } catch (e) {
            console.error("Failed to parse speed");
        }
        controls.setSpeed(speed * step);
        // alt: stateStore.update(current => ({ ...current, speed: speed * step }));
    }

    function onKeyDown(e) {
        if (e.key === " " || e.code === "Space" || e.keyCode === 32) {
          e.preventDefault();
          e.stopPropagation();
          controls && controls.pauseOrPlay();
        }
    }

    let unsubscribe;
    onMount(() => {
        unsubscribe = stateStore.subscribe(s => {
            if (!s) {
                paused = true;
                return;
            }
            paused = s.paused;
            speed = s.speed / step;
        });
        document.addEventListener("keydown", onKeyDown);
    });

    onDestroy(() => {
        unsubscribe && unsubscribe();
        document.removeEventListener("keydown", onKeyDown);
    })
</script>

<div class="anim-controls">
    <button on:click={controls.reset} type="button">
        reset
    </button>
    <!-- <button on:click={controls.stepBackwards} type="button" disabled={!paused}>
        step backwards
    </button> -->
    <button on:click={controls.pauseOrPlay} type="button">
        {#if paused}
            resume
        {:else}
            pause
        {/if}
    </button>
    <button on:click={controls.stepForwards} type="button" disabled={!paused}>
        step forward
    </button>
    <div>
        <label for="SpeedInput">Speed</label>
        <input id="SpeedInput" on:change={setSpeed} type="range" min="0" max="{5 / step}" value="{speed}">
        <span>{speed * step}x</span>
    </div>
</div>

<style>
    .anim-controls {
        margin: 10px 0;
        display: flex;
        justify-content: center;
        user-select: none;
    }

    .anim-controls > * {
        margin: 0 3px;
    }

    button {
        cursor: pointer;
    }
</style>