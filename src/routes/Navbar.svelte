<script>
    import { page } from "$app/stores";
    import { base } from '$app/paths';
    $: routeId = $page.route.id;
</script>

<nav>
    <div class="container">
        <h1>Book Dashboard</h1>
        <ul>
            <li>
                <a href="{base}/" class:active={routeId=="/"}>Overview</a>
            </li>
            <li>
                <a href="{base}/library" class:active={routeId=="/library"}>Library</a>
            </li>
        </ul>
    </div>
</nav>

<style>
    @font-face { font-family:Milkyway; src: url('/fonts/Milkyway.ttf'); }
    @font-face { font-family:Coolvetica Rg; src: url('/fonts/Coolvetica Rg.otf'); }
    @font-face { font-family:Coolvetica Rg Cond; src: url('/fonts/Coolvetica Rg Cond.otf'); }

    h1 {
		font-family: Coolvetica Rg Cond, Arial;
        letter-spacing: 2px;
		font-size: 2em;
        font-weight: normal;
        text-align: center;
        margin: 0;
        color: rgb(32, 0, 5);
        /*
        -webkit-text-fill-color: rgb(255, 210, 226);
        -webkit-text-stroke-color: rgb(26, 1, 1);
        -webkit-text-stroke-width: 0.05px; 
        */
	  }
    nav {
        background-color: #fffefc;
        margin-left: 0.3%;
        margin-right: 0.3%;
        margin-top: 0.3%;
        padding: 0.5em;
        border-radius: 25px;
        border: 1px solid #200d00;
    }
    .container {
        display: flex;
    }
    ul {
        display: flex;
        margin: 0;
        margin-left: auto;
        list-style: none;
    }
    li {
        margin-right: 20px;
    }
    a {
        text-decoration: none;
        font-family: Coolvetica Rg Cond, Arial;
        letter-spacing: 2px;
		font-size: 2em;
        font-weight: normal;
        text-align: center;
        margin: 0;
        color: #a3c4a5;
    }
    .active {
        color:#3a4d3b;
    }
</style>