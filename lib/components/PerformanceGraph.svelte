<script>
    import {onMount} from "svelte";

    export let algorithmStores;

    let usedHeap, fp, fcp, fps, avgFPS, msgsPerSec, totalMsgs, totalVisibleMsgs = 0;
    let times = [];
    let iters = 0;
    let messageIds = [];
    let newMsgIds = [];
    let once = true;
    let lastStateUpdate = 0;
    function setValues() {
        usedHeap = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
        if (!fp) fp = performance
            .getEntriesByName("first-paint")[0]?.startTime
            .toFixed(2);
        if (!fcp) fcp = performance
            .getEntriesByName("first-contentful-paint")[0]?.startTime
            .toFixed(2);

        if (algorithmStores[0] && algorithmStores[0].state && once) {
            messageIds = [];
            algorithmStores[0].state.subscribe(state => {
                newMsgIds = state.messages
                    .filter(msg => messageIds
                        .indexOf(msg.id) === -1)
                    .map(msg => msg.id);
                totalMsgs = state.messages.length;
                totalVisibleMsgs = state.messages.filter(msg => !msg.done && msg.pos && !msg.deleted).length;
                lastStateUpdate = performance.now();
            });
            once = false;
        }

        let now = performance.now();
        while (times.length > 0 && times[0] <= now - 1000) {
            times.shift();
        }
        times.push(now);
        fps = times.length;

        if (iters === 0) {
            avgFPS = fps;
        } else if (iters > 1) {
            avgFPS = (((avgFPS * iters) + fps) / (iters + 1)).toFixed(2);
        }

        if (newMsgIds && newMsgIds.length > 0) {
            messageIds.push(...newMsgIds);
            msgsPerSec = (newMsgIds.length / ((performance.now() - lastStateUpdate) / 1000)).toFixed(2);
            newMsgIds = [];
        }

        iters++;
        requestAnimationFrame(setValues);
    }

    let visible = true;
    function hide() {
        visible = !visible;
    }

    onMount(() => {
        requestAnimationFrame(setValues);
    });
</script>

<div class="performance-graph">
    <p>Performance <span class="hide-btn" on:click={hide}>{visible ? "-" : "+"}</span></p>
    {#if visible}
        <p>Used Heap: <span>{usedHeap}</span> MB</p>
        <p>FP: <span>{fp}</span> ms</p>
        <p>FCP: <span>{fcp}</span> ms</p>
        <p>fps: <span>{fps}</span></p>
        <p>Avg. fps: <span>{avgFPS}</span></p>
        <p>Total messages: <span>{totalMsgs}</span></p>
        <p>Visible Msgs: <span>{totalVisibleMsgs}</span></p>
        <p>Msgs per second: <span>{msgsPerSec}</span></p>
    {/if}
</div>

<style>
.performance-graph {
    position: fixed;
    top: 5px;
    right: 5px;
    background-color: white;
    padding: 5px;
    z-index: 999999;
    border: 1px solid;
}

p {
    margin: 0;
}

span {
    font-weight: bold;
}

span.hide-btn {
    padding: 0 8px;
    margin-left: 10px;
    background-color: black;
    color: white;
    cursor: pointer;
    font-weight: normal;
    user-select: none;
    display: block;
    float: right;
}
</style>