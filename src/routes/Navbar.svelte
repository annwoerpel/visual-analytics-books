<script lang="ts">
    import { page } from "$app/stores";
    import { base } from '$app/paths';
    import { Search, Button } from "flowbite-svelte";

    export let books = [];
    export let searchValue;


    // Lokales Suchfeld für die Searchbar
    let localSearch = searchValue;
    let showSuggestions = false;
    let searchContainer;

    function handleClickOutside(event) {
        if (searchContainer && !searchContainer.contains(event.target)) {
            showSuggestions = false;
        }
    }

    // EventListener für Klicks außerhalb
    import { onMount, onDestroy } from 'svelte';
    onMount(() => {
        if (typeof document !== 'undefined') {
            document.addEventListener('mousedown', handleClickOutside);
        }
    });
    onDestroy(() => {
        if (typeof document !== 'undefined') {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    });

    // Vorschläge filtern nach Titel, Autor oder ISBN
    $: filteredSuggestions = localSearch && localSearch.length > 0
        ? books.filter(book =>
            (book.title && book.title.toLowerCase().includes(localSearch.toLowerCase())) ||
            (book.authors && book.authors.toLowerCase().includes(localSearch.toLowerCase())) ||
            (book.isbn13 && book.isbn13.toLowerCase().includes(localSearch.toLowerCase()))
        ).slice(0, 10)
        : [];

    $: routeId = $page.route.id;
</script>

<nav class="shadow-md">
  <div class="container items-center">
    <div class="flex-1 flex justify-start">
      <h1>Book Analysis Dashboard</h1>
    </div>

    <div class="w-[500px] flex gap-2">
        <div class="flex-1 relative" bind:this={searchContainer}>
            <form 
                on:submit|preventDefault={() => { searchValue = localSearch; showSuggestions = false; }}
                on:focusin={() => showSuggestions = true}
                autocomplete="off"
            >
                <Search
                    size="sm"
                    bind:value={localSearch}
                    placeholder="Search for books..."
                    inputClass="w-full focus:ring-[#a3c4a5] focus:border-[#a3c4a5] bg-[#fffefc] placeholder-gray-400"
                    style="font-family: 'Coolvetica Rg', Arial; letter-spacing: 1.5px; font-size: 0.8em;"
                >
                    <input
                        slot="input"
                        class="w-full focus:ring-[#a3c4a5] focus:border-[#a3c4a5] bg-[#fffefc] placeholder-gray-400"
                        style="font-family: 'Coolvetica Rg', Arial; letter-spacing: 1.5px; font-size: 0.8em;"
                        bind:value={localSearch}
                        placeholder="Search for books..."
                        on:focus={() => showSuggestions = true}
                        on:input={() => showSuggestions = true}
                        autocomplete="off"
                    />
                    <Button type="submit" class="bg-[#a3c4a5] hover:bg-[#657a66] text-[#fffefc] px-2 py-2"
                        style="font-family: 'Coolvetica Rg', Arial; letter-spacing: 1.5px; font-size: 0.8em;">
                        Search
                    </Button>
                </Search>
                {#if showSuggestions && filteredSuggestions.length > 0}
                    <div class="flex flex-col absolute left-0 top-full w-full bg-white border border-gray-300 rounded mt-1 shadow-lg max-h-40 overflow-auto z-50">
                        {#each filteredSuggestions as suggestion}
                            <button
                                type="button"
                                class="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer suggestion-btn"
                                on:click={() => { searchValue = suggestion.title; localSearch = suggestion.title; showSuggestions = false; }}>
                                <span>{suggestion.title}</span>
                                {#if suggestion.authors}
                                    <span class="ml-2 text-gray-400">{suggestion.authors}</span>
                                {/if}
                            </button>
                        {/each}
                    </div>
                {/if}
            </form>
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
        font-size: 1.3em;
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
        font-size: 1.3em;
        font-weight: normal;
        text-align: center;
        margin: 0;
        color: #a3c4a5;
    }
    .active {
        color:#3a4d3b;
    }
    .suggestion-btn {
        font-size: 0.85em !important;
    }
</style>