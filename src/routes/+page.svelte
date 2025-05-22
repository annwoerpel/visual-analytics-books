<h1>Book Dashboard</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<script>
    const { data } = $props();

    const rescale = function(x, domain_min, domain_max, range_min, range_max) {
    return ((range_max - range_min)*(x-domain_min))/(domain_max-domain_min) + range_min
}
</script>

<svg width="800" height="400">
    {#each data.books as book}
        <circle cx={rescale(book.published_year, 1850, 2030, 0, 800)} 
                cy={rescale(book.num_pages, 0, 5000, 400, 0)} 
                r=4 />
    {/each}
</svg>

<style>
    svg {
        border: 1px;
        border-style: solid;
    }
    circle {
        fill: steelblue;
        fill-opacity: 0.5;
    }
</style>