<script>
    import { afterUpdate, onMount } from "svelte";
    import { labels } from "../lang/labels.mjs";
    import Block from "./Block.svelte";

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
            // TODO: Transfer to to parent
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
        <p>{labels.info.byMessageCommand[element.command]}</p>
        <ul class="property-list">
            <li>command: <span>{element.command}</span></li>

            {#if element.command === "blocks"}
                <li>entries:
                    <ul class="property-list entries">
                        {#each element.entries as block}
                            <li>
                                <Block block="{block}" />
                            </li>
                        {/each}
                    </ul>
                </li>
            {:else if element.command === "rawtransaction" || element.command === "REQUEST"}
                <li>transaction: <span>{element.tx}</span></li>
            {:else if element.command === "submitblock"}
                <Block block="{element.block}"/>
            {/if}

            <!-- <li>generation: <input type="text" bind:value="{element.n}"></li> -->
        </ul>
        <button on:click={actions.delete}>delete</button>
        <button on:click={actions.modify}>modify</button>
    {:else}
        <h1>Node {element.id}</h1>
        <p>
            <span>{labels.info.byNodeType[element.type] || "No information"}</span>
            <span>{labels.info.byNodeSync[element.sync] || ""}</span>
        </p>
        <ul class="property-list">
            <li>type: <span>{element.type}</span></li>
            <li>state: <span>{element.state}</span></li>
            {#if element.type !== "client"} <li>sync: <span>{element.sync === true}</span></li> {/if}
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

    .property-list li {
        color: orangered;
    }

    .property-list li > span {
        color: cadetblue;
    }

    .property-list.entries {
        list-style-type: disc;
    }
</style>