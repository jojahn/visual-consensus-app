<script>
    export let block;
</script>

<ul class="block">
    <li>prevHeaderHash: <span>0x{block.header?.prevHeaderHash?.slice(0, 8)}...</span></li>
    <li>merkleRoot: <span>{block.header?.merkleRoot}</span></li>
    <li>height: <span>{block.height}</span></li>
    <li>timestamp: <span>{new Date(block.timestamp).toLocaleString()}</span></li>
    {#if block.transactions && block.transactions.length !== 0}
        <div>transactions: <ul class="transactions">
            {#each block.transactions as tx}
                <li>{tx}</li>
            {/each}
        </ul></div>
    {/if}
</ul>

<style>
    ul.block {
        list-style-type: none;
        margin: 0;
        padding: 0;
    }
</style>