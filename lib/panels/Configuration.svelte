<script>
    export let configStore;
    export let fullLayout = false;

    const onSubmit = (event) => {
        event.preventDefault();
    }
</script>

<form class={"config-form" + fullLayout ? " full-layout" : ""} on:submit={onSubmit}>
    <div class="options">
        <div class="input-group">
            <label for="NetworkDelayInput">Network Delay</label>
            <div>
                <input id="NetworkDelayInput" type="number" min="0" max="60000" bind:value="{$configStore.networkDelay}">
                <span>ms</span>
            </div>
        </div>
        <div class="input-group">
            <label for="CommandDelayInput">Command Delay</label>
            <div>
                <input id="CommandDelayInput" type="number" min="0" max="60000" bind:value="{$configStore.commandDelay}">
                <span>ms</span>
            </div>
        </div>
        <div class="input-group">
            <label for="UseWebWorkersInput">Use WebWorkers</label>
            <input id="UseWebWorkersInput" disabled="{!import.meta.env.DEV}" type="checkbox" bind:checked="{$configStore.useWorkers}">
        </div>
    </div>

    <slot name="algorithm-config" config="{configStore}"></slot>
</form>

<style>
    .input-group > * {
        display: block;
    }

    .full-layout {
        width: 100%;
        padding: 10px;
        display: flex;
        justify-content: center;
    }

    .full-layout > * {
        margin-right: 10px;
    }
</style>