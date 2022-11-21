<script>
  export let stateStore;
</script>

<div style="overflow: auto;">
    <ul class="nodes">
        {#if stateStore} {#each $stateStore.nodes.filter(n => n.type === "node") as node}
            <li class="chain">
                <h1>{node.id}</h1>
                <ul class="chain-list">
                    {#if node.chain} {#each node.chain as block} {#if block}
                        <li class="block {$stateStore.selectedElementId === node.id ? 'selected' : ''}" >
                            <p>prevHeaderHash: <span>{block.header.prevHeaderHash &&
                                "0x" + block.header.prevHeaderHash?.slice(0, 8) + "..."}</span></p>
                            <p>merkleRoot: <span>{block.header.merkleRoot}</span></p>
                            <p>height: <span>{block.height}</span></p>
                            {#if block.transactions && block.transactions.length !== 0}
                                <div>transactions: <ul class="transactions">
                                {#each block.transactions as tx}
                                    <li>{tx}</li>
                                {/each}
                            </ul></div> {/if}
                        </li> <p class="arrow">&gt;</p> {/if}
                    {/each} {/if}
                </ul>
            </li>
        {/each} {/if}
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

    ul.chain-list {
        overflow: visible;
    }

    .nodes {
        flex-direction: column;
    }

    .chain {
        display: flex;
        margin: 10px;
    }

    .chain > h1 {
        margin: 0;
        margin-right: 10px;
        line-height: 30px;
    }

    .block {
        border: 1px solid black;
        padding: 5px;
    }

    .block > p {
        padding: 0;
        margin: 0;
    }

    .selected {
        box-shadow: 0 0 0px 5px #f497a4;
    }

    .transactions {
        list-style-type: disc !important;
        padding-left: 20px;
    }

    .arrow {
        font-size: 2rem;
        margin: 0;
        padding: 0;
        font-weight: lighter;
        font-family: courier,serif;
        margin: auto 10px;
    }
</style>