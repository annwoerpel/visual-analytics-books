
<script>
    import "../app.css";
    import Navbar from "./Navbar.svelte";
    export let data;
    import { writable } from 'svelte/store';
    const books = data.books ?? [];
    // Globale Filterwerte als Store
    export let searchValue = "";
    export let selectedGenre = "";
</script>

<svelte:head>
    <title>Book Analysis Dashboard</title> 
</svelte:head>

<Navbar {books} bind:searchValue bind:selectedGenre />

<div class="bg-img"></div>

<slot {searchValue} {selectedGenre} />

<style>
    :global(.bg-img) {
        position: fixed;
        top: 0;
        height: 100vh;
        width: 100vw;
        background-image: url('$lib/blur-background.jpg');
        background-color: #eaffd7; /* Used if the image is unavailable */
        background-repeat: no-repeat;
        background-size: cover;
        z-index: -1;
    }
</style>
