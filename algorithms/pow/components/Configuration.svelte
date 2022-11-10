<script>
    export let config;
</script>

<div>
    <div class="input-group">
        <label>Number of Clients
            <input type="number" min="1" max={import.meta.env.DEV ? 10000 : 10} bind:value="{$config.numberOfClients}">
        </label>
    </div>

    <div class="input-group">
        <label>Number of Nodes
            <input type="number" min="1" max={import.meta.env.DEV ? 10000 : 10} bind:value="{$config.numberOfNodes}">
        </label>
    </div>
</div>