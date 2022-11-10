<script>
    export let hoveredElement;
    export let offsetY = 0;
    export let offsetX = 0;
</script>

{#if $hoveredElement && $hoveredElement.pos}
    <div class="node-info" style="{`top: ${$hoveredElement.pos[1] + offsetY}px; left: ${$hoveredElement.pos[0] + offsetX}px;`}">
        {#if $hoveredElement.fromId}
            <span><b>{$hoveredElement.id}</b></span>
            <span>{$hoveredElement.method}</span>
            <span><i>&lt;&lt;{$hoveredElement.state}&gt;&gt;</i></span>
            <span>Click message to manipulate it</span>
        {:else}
            <span><b>{$hoveredElement.id}</b></span>
            <span>{$hoveredElement.type}</span>
            <span><i>&lt;&lt;{$hoveredElement.state}&gt;&gt;</i></span>
            <span>Click node to control it</span>
        {/if}
    </div>
{/if}

<style>
    .node-info {
        display: flex;
        padding: 4px;
        flex-direction: column;
        background-color: wheat;
        position: absolute;
        top: 0;
        left: 0;
        font-size: 1rem;
    }

    .node-info > *:last-child {
        font-size: 0.75rem;
    }
</style>