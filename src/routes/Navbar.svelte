<script>
    import { page } from "$app/stores";
    import { base } from '$app/paths';
    import { Search, Button } from "flowbite-svelte";

    export let books;

    let searchValue = "";

    $: routeId = $page.route.id;

    $: filteredSuggestions = searchValue.length > 0
        ? books.filter(book => book.title?.toLowerCase().includes(searchValue.toLowerCase()))
        : [];
</script>

<nav>
  <div class="container items-center">
    <div class="flex-1 flex justify-start">
      <h1>Book Analysis Dashboard</h1>
    </div>

    <!-- Äußere Struktur bleibt wie bisher -->
    <div class="w-[500px]"> <!-- Kein relative hier -->
        <div class="relative"> <!-- Nur dieser ist relative -->
            <Search
                size="md"
                bind:value={searchValue}
                placeholder="Search for books..."
                inputClass="w-full focus:ring-[#a3c4a5] focus:border-[#a3c4a5] bg-[#fffefc] placeholder-gray-400"
                style="font-family: 'Coolvetica Rg', Arial; letter-spacing: 1.5px; font-size: 1em;">
                <Button class="bg-[#a3c4a5] hover:bg-[#657a66] text-[#fffefc]"
                    style="font-family: 'Coolvetica Rg', Arial; letter-spacing: 1.5px; font-size: 1em;">
                    Search
                </Button>
            </Search>

            {#if filteredSuggestions.length > 0}
                <div class="flex flex-col absolute left-0 top-full w-full bg-white border border-gray-300 rounded mt-1 shadow-lg max-h-40 overflow-auto z-50">
                    {#each filteredSuggestions as suggestion}
                        <button
                            type="button"
                            class="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            style="font-family: 'Coolvetica Rg', Arial; letter-spacing: 1.5px; font-size: 1em;"
                            on:click={() => searchValue = suggestion.title}>
                            {suggestion.title}
                        </button>
                    {/each}
                </div>
            {/if}
        </div>
    </div>


    <ul class="flex-1 flex justify-end">
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
        border-radius: 12px;
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