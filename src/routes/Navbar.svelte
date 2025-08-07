<script lang="ts">
    import { page } from "$app/stores";
    import { base } from '$app/paths';
    import { Banner } from "flowbite-svelte";

    $: routeId = $page.route.id;
</script>

<Banner dismissable={false} class="shadow-md h-14" style="background-color: #fffefc;
        margin-left: 0.1%;
        margin-right: 0.1%;
        margin-top: 0.1%;
        padding: 0.3em;
        border-radius: 8px;
        max-width: 99.8%;
        width: 99.8%;">

  <div class="flex justify-between items-center w-full space-x-55">

    <div class="flex justify-start">
      <h2>Book Popularity Analysis</h2>
    </div>

    <slot name="slider"/>

    <ul class="flex items-center space-x-6">
      <li>
        <a href="{base}/" class:active={routeId == "/"}>Analytics</a>
      </li>
      <li>
        <a href="{base}/library" class:active={routeId == "/library"}>Library</a>
      </li>
    </ul>
  </div>

</Banner>


<style>
    @font-face { font-family:Milkyway; src: url('/fonts/Milkyway.ttf'); }
    @font-face { font-family:Coolvetica Rg; src: url('/fonts/Coolvetica Rg.otf'); }
    @font-face { font-family:Coolvetica Rg Cond; src: url('/fonts/Coolvetica Rg Cond.otf'); }

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
    a {
        text-decoration: none;
        font-family: Coolvetica Rg Cond, Arial;
        letter-spacing: 2px;
        font-size: 1.1em;
        font-weight: normal;
        text-align: center;
        margin: 0;
        color: #a3c4a5;
        transition: color 0.2s ease-in-out;
    }

    a:hover {
      color: #3a4d3b; /* dunkleres Grün als #a3c4a5 */
    }

    .active {
        color:#3a4d3b;
    }
</style>