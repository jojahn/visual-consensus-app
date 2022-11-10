<script>
    import algorithms from "../algorithms";

    export let selectedAlgorithm;
    export let changeAlgorithm;
    export let share;

    const setAlgorithm = (name) => () => changeAlgorithm(name);

    function onShareClicked() {
        share();
    }
</script>

<header>
    <nav>
        <ul>
            {#each Object.values(algorithms) as a}
                <li class={selectedAlgorithm === a.key ? "active" : ""}>
                    <button on:click={setAlgorithm(a.key)}>{a.title}</button>
                </li>
            {/each}
            <li>
                <a href="/about.html">About</a>
            </li>
            <!-- <li>
                <button on:click={onShareClicked}>Share</button>
            </li> -->
        </ul>
    </nav>

</header>

<style>
    header {
        padding-left: 20px;
        height: 50px;
        background-color: #222;
        border-bottom: 1px solid #ddd;
    }

    header * {
        color: #ddd !important;
    }

    nav {
        height: 100%;
    }

    nav > ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
        display: flex;
        height: 100%;
    }

    nav > ul > li {
        margin: auto 0;
    }

    a {
        text-decoration: none;
    }

    button, a {
        font-size: 1rem;
        padding: 0 10px;
        border: none;
        height: 35px;
        cursor: pointer;
        background-color: transparent;
        opacity: 0.5;
    }

    .active button {
        opacity: 1;
    }
</style>