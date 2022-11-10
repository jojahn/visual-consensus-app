<script>
    import { afterUpdate } from "svelte";

    export let element;
    export let actions = [];

    let isMessage = false;
    afterUpdate(() => {
        isMessage = element && element.fromId;
    })
    let dialog;
</script>

<div
        bind:this={dialog}
        class="node-actions-panel"
>
    {#if !element}
        <span>No valid element select</span>
    {:else if isMessage}
        <h1>Message {element.id}</h1>
        <p>{element.toId} → {element.fromId}</p>
        <p>{labels.info.byMessageMethod[element.method]}</p>
        <ul class="property-list">
            <li>method: <span>{element.method}</span></li>
            <li>value: <input type="text" bind:value="{element.value}"></li>
            <li>generation: <input type="text" bind:value="{element.n}"></li>
        </ul>
        <button on:click={actions.delete}>delete</button>
        <button on:click={actions.modify(element)}>modify</button>
    {:else}
        <h1>Node {element.id}</h1>
        <p>type: {element.type}</p>
        <p>state: {element.state}</p>
        <ul class="property-list">
            <li>method: <span>{element.method}</span></li>
            <li>value: <input type="text" bind:value="{element.value}"></li>
            <li>generation: <input type="text" bind:value="{element.n}"></li>
        </ul>
        {#if element.type === "client"}
            <button on:click={actions.request}>request</button>
        {/if}
        <button on:click={actions.restart}>restart</button>
        <button on:click={actions.connectOrDisconnect}>{element.running === "DISCONNECTED" ? "connect" : "disconnect"}</button>
        <button on:click={actions.takeover} disabled>takeover</button>
    {/if}
</div>

<style>
    .property-list {
        list-style-type: none;
        margin: 0;
        padding: 0;
    }

    .property-list > li {
        color: orangered;
    }

    .property-list > li > span {
        color: cadetblue;
    }

    .node-actions > button:first-child {
        float: right;
    }

    .node-actions > h1 {
        margin: 0;
        font-size: 1.25rem;
    }
    .node-actions > p {
        margin: 0 0 10px;
        font-size: 1rem;
    }
</style>