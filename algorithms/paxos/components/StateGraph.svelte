<script>
    import {onMount} from "svelte";

    export let configStore;
    export let stateStore;
</script>

<div style="overflow: auto;">
    <ul class="nodes">
        {#if stateStore}
            {#each $stateStore.nodes.filter(n => n.type === "node" && n.log) as node}
                <li class="log">
                    <h1>{node.id}</h1>
                    <ul class="{$stateStore.selectedElementId === node.id ? 'selected' : ''}">
                        {#each node.log as entry}
                            <li class="entry">{entry}</li>
                        {/each}
                    </ul>
                </li>
            {/each}
        {/if}
    </ul>
</div>

<style>
    ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
        display: flex;
        overflow: auto;
    }

    .nodes {
        flex-direction: column;
    }

    .log {
        display: flex;
        margin: 10px;
    }

    .log > h1 {
        margin: 0;
        margin-right: 10px;
        line-height: 30px;
    }

    .entry {
        border: 1px solid black;
        padding: 5px;
    }

    .entry:not(:first-child) {
        border-left: none;
    }

    .selected {
        box-shadow: 0 0 0px 5px #f497a4;
    }
</style>