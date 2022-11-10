<footer>
    <div class="content">
        <div class="brand">
            <img alt="logo" src="/favicon/android-icon-48x48.png"><span>Visual Consensus</span>
        </div>
        <div class="links">
            <p>Links</p>
            <a href="https://github.com/jojahn/visual-consensus">Source Code</a>
            <a href="https://github.com/jojahn/visual-consensus/blob/main/latex/thesis.pdf">Thesis</a>
            <a href="about.html#ThirdPartyLicenses">Third Party Licenses</a>
        </div>
    </div>
    <div>
        <p class="rights">Licensed under <a href="https://github.com/jojahn/visual-consensus/LICENSE">MIT</a></p>
        <p class="rights">2022 <a href="https://github.com/jojahn/visual-consensus/graphs/contributors">contributers</a></p>
    </div>
</footer>

<style>
    footer {
        padding: 10px 0;
        top: 100vh;
        background-color: #ddd;
        width: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .content {
        max-width: 60vw;
        min-width: 300px;
        width: 100%;
        display: flex;
        justify-content: space-evenly;
        flex-direction: row;
        margin: auto auto 20px;
    }

    .links {
        display: flex;
        flex-direction: column;
    }

    a {
        text-decoration: none;
        border-bottom: 0.1rem dotted blue;
        width: max-content;
    }

    .rights {
        margin: 0;
        padding: 0;
        color: #888;
        text-align: center;
    }

    .brand {
        display: flex;
    }

    .brand > span {
        display: block;
        line-height: 48px;
        padding-left: 10px;
    }

    .brand > img {
        width: 48px;
        height: 48px;
    }
</style>