<script>
    export let data;

    import BookComponent from "../BookComponent.svelte";
    import BookSidebar from "../BookSidebar.svelte";
    import { Tabs, TabItem, Checkbox, Search } from "flowbite-svelte";

    let books = data.books ?? [];
    let selectedBook = null;
    let myLibrary = [];
    export let searchValue = "";
    export let selectedGenre = "";

    // Nur die häufigsten Genres extrahieren
    $: genreCounts = {};
    $: books.forEach(b => {
        (b.categories?.split(',').map(c => c.trim()) ?? []).forEach(cat => {
            if (cat) genreCounts[cat] = (genreCounts[cat] || 0) + 1;
        });
    });
    $: genres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([genre]) => genre);

    // Filterfunktion
    $: filteredBooks = books.filter(book => {
        const matchesSearch =
            !searchValue ||
            book.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
            book.authors?.toLowerCase().includes(searchValue.toLowerCase()) ||
            book.isbn13?.toLowerCase().includes(searchValue.toLowerCase());
        const matchesGenre =
            !selectedGenre ||
            (book.categories && book.categories.split(',').map(c => c.trim()).includes(selectedGenre));
        return matchesSearch && matchesGenre;
    });

    function openSidebar(book) {
        selectedBook = book;
    }

    function closeSidebar() {
        selectedBook = null;
    }

    function handleToggleLibrary(book, checked) {
        if (checked) {
            if (!myLibrary.includes(book.isbn13)) {
                myLibrary = [...myLibrary, book.isbn13];
            }
        } else {
            myLibrary = myLibrary.filter(id => id !== book.isbn13);
        }
    }

    // Local search, genre and page count filter for UI controls
    let localSearch = "";
    let localGenreArray = [];
import { onMount } from "svelte";
let maxPagesFilter = 0;
// Ermittle die maximal vorkommende Seitenzahl für den Slider
$: maxPages = Math.max(0, ...books.map(b => parseInt(b.num_pages) || 0));
onMount(() => {
    maxPagesFilter = maxPages;
});
    function toggleGenre(genre) {
        if (localGenreArray.includes(genre)) {
            localGenreArray = localGenreArray.filter(g => g !== genre);
        } else {
            localGenreArray = [...localGenreArray, genre];
        }
    }
    $: localFilteredBooks = books.filter(book => {
        const matchesSearch =
            !localSearch ||
            book.title?.toLowerCase().includes(localSearch.toLowerCase()) ||
            book.authors?.toLowerCase().includes(localSearch.toLowerCase()) ||
            book.isbn13?.toLowerCase().includes(localSearch.toLowerCase());
        const matchesGenre =
            localGenreArray.length === 0 ||
            (book.categories && book.categories.split(',').map(c => c.trim()).some(g => localGenreArray.includes(g)));
        const matchesPages =
            !book.num_pages || isNaN(parseInt(book.num_pages)) || parseInt(book.num_pages) <= maxPagesFilter;
        return matchesSearch && matchesGenre && matchesPages;
    });
</script>

<div class="flex mt-5 ml-3 mr-3 mb-5">
    <!-- Search and Filter Sidebar -->
    <aside class="w-64 min-h-[600px] bg-[#f7f7f4] rounded-xl shadow-md p-5 mr-8 flex flex-col items-start">
        <Search
            size="sm"
            bind:value={localSearch}
            placeholder="Search books"
            inputClass="w-full focus:ring-[#a3c4a5] focus:border-[#a3c4a5] bg-[#fffefc] placeholder-gray-400"
            style="font-family: 'Coolvetica Rg', Arial; letter-spacing: 1.5px; font-size: 0.8em;"
        >
        </Search>
        <div class="w-full mt-3">
            <div class="mb-2 mt-3" style="font-family: Coolvetica Rg Cond, Arial;
                                            letter-spacing: 2px;
                                            font-size: 1.2em;
                                            font-weight: normal;
                                            margin: 0;
                                            color: rgb(0, 0, 0);"
            >Genres</div>
            {#each genres as genre}
                <label class="flex items-center mb-2 mt-2" style="font-family: 'Coolvetica Rg', Arial; letter-spacing: 1.5px; font-size: 0.8em;">
                    <input
                        type="checkbox"
                        class="mr-2 accent-[#a3c4a5]"
                        value={genre}
                        checked={localGenreArray && localGenreArray.includes(genre)}
                        on:change={() => toggleGenre(genre)}
                    />
                    {genre}
                </label>
            {/each}
        </div>
        <div class="w-full mt-6">
            <div class="mb-2" style="font-family: Coolvetica Rg Cond, Arial; letter-spacing: 2px; font-size: 1.1em;">Max number of pages</div>
            <input type="range" min="0" max={maxPages} step="10" bind:value={maxPagesFilter} class="w-full accent-[#a3c4a5]" />
            <div class="text-xs mt-1 mb-2" style="font-family: 'Coolvetica Rg', Arial;">{maxPagesFilter} pages or less</div>
        </div>
    </aside>
    <!-- Main Content -->
    <div class="flex-1">
        <Tabs class="rounded-t-xl bg-[#fffefc] shadow-lg mt-0">
            <TabItem
                title="All Books"
                open
                activeClass="bg-[#a3c4a5]/90 text-white min-w-[120px] h-[60px] flex flex-col items-center justify-center rounded-lg"
                inactiveClass="bg-[#fffefc] text-[#3a4d3b] hover:text-white hover:bg-[#a3c4a5] min-w-[120px] h-[60px] flex flex-col items-center justify-center rounded-lg"
                style="font-family: 'Coolvetica Rg', Arial;"
            >
                <div class="scrollable-tab-content">
                    <div class="grid grid-cols-10 gap-3 p-2">
                        {#each localFilteredBooks as book}
                            <BookComponent {book} onOpenSidebar={openSidebar} />
                        {/each}
                    </div>
                </div>
            </TabItem>

            <TabItem
                title="My Books"
                activeClass="bg-[#a3c4a5]/90 text-white min-w-[120px] h-[60px] flex flex-col items-center justify-center rounded-lg"
                inactiveClass="bg-[#fffefc] text-[#3a4d3b] hover:text-white hover:bg-[#a3c4a5] min-w-[120px] h-[60px] flex flex-col items-center justify-center rounded-lg"
                style="font-family: 'Coolvetica Rg', Arial;"
            >
                <div class="scrollable-tab-content">
                    <div class="grid grid-cols-10 gap-3 p-2">
                        {#each localFilteredBooks.filter(book => myLibrary.includes(book.isbn13)) as book}
                            <BookComponent {book} onOpenSidebar={openSidebar} />
                        {/each}
                    </div>
                    {#if localFilteredBooks.filter(book => myLibrary.includes(book.isbn13)).length === 0}
                        <p class="text-sm tracking-wide text-center mt-8 text-gray-400"
                            style="font-family: 'Coolvetica Rg', Arial;">
                            There are no books in your library yet. Add some books to see them here!
                        </p>
                    {/if}
                </div>
            </TabItem>
        </Tabs>
    </div>
</div>

<BookSidebar
    book={selectedBook}
    inLibrary={selectedBook && myLibrary.includes(selectedBook.isbn13)}
    onClose={closeSidebar}
    onToggleLibrary={handleToggleLibrary}
/>

<style>
    @font-face { font-family:Milkyway; src: url('/fonts/Milkyway.ttf'); }
    @font-face { font-family:Coolvetica Rg; src: url('/fonts/Coolvetica Rg.otf'); }
    @font-face { font-family:Coolvetica Rg Cond; src: url('/fonts/Coolvetica Rg Cond.otf'); }
    .scrollable-tab-content {
        height: 550px;
        overflow-y: auto;
    }
</style>