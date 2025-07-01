<script>
    import "../app.css";
    import Navbar from "./Navbar.svelte";
    export let data;
    const books = data.books ?? [];
</script>

<svelte:head>
    <title>Book Analysis Dashboard</title> 
</svelte:head>

<Navbar {books} />

<div class="bg-img"></div>

<slot />

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
