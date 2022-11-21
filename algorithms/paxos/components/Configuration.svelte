<script>
    export let config;
</script>

<div class="algorithm-specific-options">
    <!-- <div class="input-group">
        <label>Use single nodes for all classes
            <input type="checkbox" bind:checked="{$config.useSingleNodes}">
        </label>
    </div> -->
    <div class="input-group">
        <label>Number of Clients
            <input type="number" min="1" max={import.meta.env.DEV ? 10000 : 5} bind:value="{$config.numberOfClients}">
        </label>
    </div>

    {#if $config.useSingleNodes}
        <div class="input-group">
            <label>Number of Nodes
                <input type="number" min="1" max={import.meta.env.DEV ? 10000 : 15} bind:value="{$config.numberOfNodes}">
            </label>
        </div>
    {:else}
        <div class="input-group">
            <label>Number of Proposers
                <input type="number" min="1" max="10" bind:value="{$config.numberOfProposers}">
            </label>
        </div>
        <div class="input-group">
            <label>Number of Acceptors
                <input type="number" min="1" max="10" bind:value="{$config.numberOfAcceptors}">
            </label>
        </div>
        <div class="input-group">
            <label>Number of Learners
                <input type="number" min="1" max="10" bind:value="{$config.numberOfLearners}">
            </label>
        </div>
    {/if}
    <div class="input-group">
        <label>Learner Implementation
            <select bind:value="{$config.learnerImpl}">
                <option value="none">none</option>
                <option value="contactAllAcceptors">contact all acceptors</option>
            </select>
        </label>
    </div>
</div>



