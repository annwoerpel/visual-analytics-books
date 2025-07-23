<script>
    export let data;

    import BookComponent from "../BookComponent.svelte";
    import BookSidebar from "../BookSidebar.svelte";
    import { Tabs, TabItem, Checkbox, Search } from "flowbite-svelte";

    import { Chart } from 'svelte-echarts'
    import { init, use } from 'echarts/core'
    import { RadarChart } from 'echarts/charts'
    import { GridComponent, TitleComponent, LegendComponent } from 'echarts/components'
    import { CanvasRenderer } from 'echarts/renderers'

    let books = data.books ?? [];
    let selectedBook = null;
    let myLibrary = [];

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

    use([RadarChart, GridComponent, CanvasRenderer, TitleComponent, LegendComponent]);

    $: userGenreCounts = {};
    $: books.forEach(b => {
        if (myLibrary.includes(b.isbn13)) {
            (b.categories?.split(',').map(c => c.trim()) ?? []).forEach(cat => {
                if (genres.includes(cat)) {
                    userGenreCounts[cat] = (userGenreCounts[cat] || 0) + 1;
                }
            });
        }
    });

    onMount(() => {
        maxPagesFilter = maxPages;

        if (books.length > 0 && myLibrary.length === 0) {
            // Bücher mit Drama oder Fiction
            const favored = books.filter(b =>
                b.categories?.includes('Fiction') ||
                b.categories?.includes('Drama')
            );

            // Restliche Bücher
            const others = books.filter(b => !favored.includes(b));

            // Mische bevorzugte und andere Bücher
            const combined = [
                ...favored.sort(() => 0.5 - Math.random()).slice(0, 15),
                ...others.sort(() => 0.5 - Math.random()).slice(0, 15)
            ];

            // Extrahiere isbn13
            myLibrary = combined.map(b => b.isbn13);
        }
    });

    $: radarIndicators = genres.map(g => ({
        name: g,
        max: 5  // Bewertungen gehen meist von 0 bis 5
    }));

    $: radarAllTaste = genres.map(g => parseFloat(allGenreRatings[g]?.toFixed(2)) || 0);
    $: radarUserTaste = genres.map(g => parseFloat(userGenreRatings[g]?.toFixed(2)) || 0);


    $: allGenreRatings = {};
    $: userGenreRatings = {};

    $: genres.forEach(genre => {
    const genreBooksAll = books.filter(b =>
        b.categories?.split(',').map(c => c.trim()).includes(genre) &&
        !isNaN(parseFloat(b.average_rating))
    );
    const genreBooksUser = books.filter(b =>
        myLibrary.includes(b.isbn13) &&
        b.categories?.split(',').map(c => c.trim()).includes(genre) &&
        !isNaN(parseFloat(b.average_rating))
    );

    const avgAll = genreBooksAll.length > 0
        ? genreBooksAll.reduce((sum, b) => sum + parseFloat(b.average_rating), 0) / genreBooksAll.length
        : 0;

    const avgUser = genreBooksUser.length > 0
        ? genreBooksUser.reduce((sum, b) => sum + parseFloat(b.average_rating), 0) / genreBooksUser.length
        : 0;

    allGenreRatings[genre] = avgAll;
    userGenreRatings[genre] = avgUser;
    });


    $: option_radar = {
        title: { text: 'Genre Taste Comparison' },
        legend: { 
            show: true,
            bottom: 0,
            data: ['Everyone', 'My Taste'] },
        radar: {
            indicator: radarIndicators
        },
        series: [{
            name: 'Genre Preferences',
            type: 'radar',
            data: [
                {
                    value: radarAllTaste,
                    name: 'Everyone',
                    itemStyle: {
                        color: '#88C0D0'  // Farbe der Fläche
                    },
                    lineStyle: {
                        color: '#5E81AC'  // Randlinie
                    },
                    areaStyle: {
                        opacity: 0.3
                    }
                },
                {
                    value: [5,4.5,3,3.8,4,1.5,5,3,2.5,3.5],
                    name: 'My Taste',
                    itemStyle: {
                        color: '#A3BE8C'
                    },
                    lineStyle: {
                        color: '#8FBCBB'
                    },
                    areaStyle: {
                        opacity: 0.3
                    }
                }
            ]
        }]
    };

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
        <Tabs>
            <TabItem
                title="All Books"
                open
                activeClass="bg-[#a3c4a5]/90 text-white min-w-[120px] h-[60px] flex flex-col items-center justify-center rounded-lg"
                inactiveClass="bg-[#fffefc] text-[#3a4d3b] hover:text-white hover:bg-[#a3c4a5] min-w-[120px] h-[60px] flex flex-col items-center justify-center rounded-lg"
                style="font-family: 'Coolvetica Rg', Arial;"
            >
                <div class="scrollable-tab-content">
                    <div class="grid grid-cols-10 gap-1 items-center p-4">
                        {#each localFilteredBooks as book}
                            <div class="w-full h-35">
                                <BookComponent {book} index={100} onOpenSidebar={openSidebar} />
                            </div>
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
                    <div class="grid grid-cols-10 gap-1 items-center p-4">
                        {#each localFilteredBooks.filter(book => myLibrary.includes(book.isbn13)) as book}
                            <div class="w-full h-35">
                                <BookComponent {book} index={0} onOpenSidebar={openSidebar} />
                            </div>
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

<div class="radar-graph">
    <Chart {init} options={option_radar} />
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
        background-color: #fffefc;
    }

    .radar-graph {
        width: 70vw;
        height: 70vh;
        background-color: #fffefc;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 1rem;
        margin: 1rem auto;
    }

</style>