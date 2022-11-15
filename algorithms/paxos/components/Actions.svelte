<script>
    import { afterUpdate, onMount } from "svelte";
    import { labels } from "../lang/labels.mjs";

    export let element;
    export let actions;

    function requestValueAction(_config, _state, runners) {
        runners[element.id].postMessage({
            nodeId: element.id,
            isFlow: true,
            type: "CLIENT_REQUEST",
            v: clientReqValue
        });
    }
    function modify() {
        actions.modify(element);
    }
    let clientReqValue = "777";
    let elementId = "";
    let isMessage = false;
    let request = () => undefined;
    afterUpdate(() => {
        if (actions && !isMessage && element && element.type === "client") {
            request = actions.createNewAction(requestValueAction);
        }

        if (element && elementId !== element.id) {
            clientReqValue = element.id; // `SET x = "${element.id}"`;
            elementId = element.id;
            isMessage = element && element.fromId;
        }
    });
</script>

<div class="node-actions-panel">
    {#if !element}
        <span>No valid element select</span>
    {:else if isMessage}
        <h1>Message {element.id}</h1>
        <p>{element.toId} → {element.fromId}</p>
        <p>{labels.info.byMessageMethod[element.method]}</p>
        <ul class="property-list">
            <li>method: <span>{element.method}</span></li>
            {#if ["REQUEST", "ACCEPTED", "ACCEPT"].indexOf(element.method) !== -1}
                <li>value: <input type="text" bind:value="{element.v}"></li>
            {/if}
            {#if ["ACCEPT", "ACCEPTED", "PROMISE", "PREPARE", "IGNORED"].indexOf(element.method) !== -1}
                <li>generation: <input type="text" bind:value="{element.n}"></li>
            {/if}
        </ul>
        <button on:click={actions.delete}>delete</button>
        <button on:click={actions.modify}>modify</button>
    {:else}
        <h1>Node {element.id}</h1>
        <p>
            <span>{labels.info.byNodeType[element.type] || "No information"}</span>
            <span>{labels.info.byNodeState[element.state] || ""}</span>
        </p>
        <ul class="property-list">
            <li>type: <span>{element.type}</span></li>
            <li>state: <span>{element.state}</span></li>
        </ul>

        {#if element.type === "client"}
            <input type="text" bind:value={clientReqValue}>
            <button on:click={request}>request</button>
        {/if}
        <button on:click={actions.restart}>restart</button>
        <button on:click={actions.connectOrDisconnect}>{element.connected ? "disconnect" : "reconnect"}</button>
        <!-- <button on:click={actions.takeover} disabled>takeover</button> -->
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
</style>