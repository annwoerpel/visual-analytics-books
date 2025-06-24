<script>
    const { data } = $props();

    const rescale = 
        function(x, domain_min, domain_max, range_min, range_max) {
            return ((range_max - range_min)*(x-domain_min))/(domain_max-domain_min) + range_min
        }

    const coverUrl = "https://books.google.com/books/content?id=KQZCPgAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api";

    // get 10 most popular books of all time
    const top_10_books  = data.books.filter(book => book.average_rating && book.ratings_count).sort((a, b) => {
        const scoreA = a.average_rating * Math.log10(a.ratings_count + 1);
        const scoreB = b.average_rating * Math.log10(b.ratings_count + 1);
        return scoreB - scoreA;
      }).slice(0, 10);
</script>

<h2>Top 10 Books</h2>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {#each top_10_books as book}
    <div class="p-4 border rounded shadow bg-white">
      <img src={book.thumbnail} alt="Cover von {book.title}" class="w-full h-auto mb-4 rounded" />
      <h2 class="text-xl font-bold">{book.title}</h2>
      <p class="text-sm text-gray-600">{book.authors}</p>
      <p class="text-sm mt-1">{book.average_rating} ({book.ratings_count} Bewertungen)</p>
    </div>
  {/each}
</div>

<svg width="800" height="400">
    {#each data.books as book}
        <circle cx={rescale(book.published_year, 1850, 2030, 0, 800)} 
                cy={rescale(book.num_pages, 0, 5000, 400, 0)} 
                r=4 />
    {/each}
</svg>

<img src={coverUrl} alt="Buchcover" />

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