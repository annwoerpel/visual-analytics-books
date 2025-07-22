<script lang="ts">
    import { page } from "$app/stores";
    import { base } from '$app/paths';
    import { Search, Button } from "flowbite-svelte";

    $: routeId = $page.route.id;
</script>

<nav class="shadow-md">
  <div class="container items-center">
    <div class="flex-1 flex justify-start">
      <h1>Book Analysis Dashboard</h1>
    </div>

    <div class=" flex">
        <h2>Popularity of Books</h2>
    </div>

    <ul class="flex-1 flex justify-end">
      <li>
        <a href="{base}/" class:active={routeId=="/"}>Analytics</a>
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
        font-size: 1.1em;
        font-weight: normal;
        text-align: center;
        margin: 0;
        color: rgb(84, 84, 84);
        /*
        -webkit-text-fill-color: rgb(255, 210, 226);
        -webkit-text-stroke-color: rgb(26, 1, 1);
        -webkit-text-stroke-width: 0.05px; 
        */
      }
    h2 {
        font-family: Coolvetica Rg Cond, Arial;
        letter-spacing: 2px;
        font-size: 1.3em;
        font-weight: normal;
        text-align: center;
        margin: 0;
        color: rgb(0, 0, 0);
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
        padding: 0.3em;
        border-radius: 12px;
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
        font-size: 1.1em;
        font-weight: normal;
        text-align: center;
        margin: 0;
        color: #a3c4a5;
    }
    .active {
        color:#3a4d3b;
    }
</style>