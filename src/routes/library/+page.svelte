<script>
    export let data;

    import BookComponent from "../BookComponent.svelte";
    import BookSidebar from "../BookSidebar.svelte";
    import Navbar from "../Navbar.svelte";
    import DoubleRangeSlider from '../DoubleRangeSlider.svelte';
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import { Tabs, TabItem, Checkbox, Search, Tooltip } from "flowbite-svelte";

    import { Chart } from 'svelte-echarts';
    import { init, use } from 'echarts/core';
    import { RadarChart, SunburstChart } from 'echarts/charts';
    import { GridComponent, TitleComponent, LegendComponent, ToolboxComponent, TooltipComponent} from 'echarts/components';
    import { CanvasRenderer } from 'echarts/renderers';

    let books = data.books ?? [];
    let selectedBook = null;
    let myLibrary = [];

    // Initialbereich: 1970–2020
    let start = 1876;
    let end = 2019;

    // Dynamische Jahrgrenzen
    let minPublishedYear = 1876;
    let maxPublishedYear = 2019;

    // Filter Rating
    let minRating = 0; // z. B. 0 bis 5

    // Nur die häufigsten Genres extrahieren
    $: genreCounts = {};
    $: books.forEach(b => {
        (b.categories?.split(',').map(c => c.trim()) ?? []).forEach(cat => {
            if (cat) genreCounts[cat] = (genreCounts[cat] || 0) + 1;
        });
    });
    $: genres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([genre]) => genre);

    $: top_10_genres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0,10)
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
            (book.categories &&
                book.categories
                    .split(',')
                    .map(c => c.trim())
                    .some(g => localGenreArray.includes(g)));

        const matchesPages =
            !book.num_pages ||
            isNaN(parseInt(book.num_pages)) ||
            parseInt(book.num_pages) <= maxPagesFilter;

        const year = parseInt(book.published_year);
        const matchesYear =
            !year || isNaN(year) || (year >= start && year <= end);

        const matchesRating =
            !book.average_rating || isNaN(parseFloat(book.average_rating)) || parseFloat(book.average_rating) >= minRating;

        return matchesSearch && matchesGenre && matchesPages && matchesYear && matchesRating;

    });

    use([RadarChart, GridComponent, CanvasRenderer, TitleComponent, LegendComponent, SunburstChart, ToolboxComponent, TooltipComponent]);

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
                ...favored.sort(() => 0.5 - Math.random()).slice(0, 150),
                ...others.sort(() => 0.5 - Math.random()).slice(0, 150)
            ];

            // Extrahiere isbn13
            myLibrary = combined.map(b => b.isbn13);
        }
    });

    $: radarIndicators = top_10_genres.map(g => ({
        name: g,
        max: 5  // Bewertungen gehen meist von 0 bis 5
    }));

    $: radarAllTaste = top_10_genres.map(g => parseFloat(allGenreRatings[g]?.toFixed(2)) || 3);
    $: radarUserTaste = top_10_genres.map(g => parseFloat(userGenreRatings[g]?.toFixed(2)) || 3);

    $: allGenreRatings = {};
    $: userGenreRatings = {};

    $: top_10_genres.forEach(genre => {
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
        legend: {
            show: true,
            left: 'center',
            itemGap: 50, // Abstand zwischen Einträgen
            textStyle: {
                fontFamily: 'Coolvetica Rg, Arial',
                fontSize: '0.8em',
                color: '#3a4d3b',
                letterSpacing: '1.2px'
            },
            data: ['Average Taste', 'My Taste']
        },
        radar: {
            indicator: radarIndicators,
            center: ['50%', '55%'], // weiter unten
            radius: '68%',          // etwas kleiner
            name: {
                formatter: function (name) {
                const maxLineLength = 10;
                if (name.length > maxLineLength) {
                    const words = name.split(' ');
                    let lines = '';
                    let currentLine = '';
                    words.forEach(word => {
                    if ((currentLine + word).length > maxLineLength) {
                        lines += currentLine + '\n';
                        currentLine = word + ' ';
                    } else {
                        currentLine += word + ' ';
                    }
                    });
                    lines += currentLine.trim();
                    return lines;
                }
                return name;
                },
                textStyle: {
                fontSize: 11,
                color: '#3a4d3b',
                fontFamily: 'Coolvetica Rg, Arial'
                }
            }
        },

        tooltip: {
            position: function (point, params, dom, rect, size) {
                return ['80%', '5%']; // [left, top] 
            },
            trigger: 'item',
            textStyle: {
                fontFamily: 'Coolvetica Rg, Arial',
                fontSize: 13,
                color: '#3a4d3b'
            },
            formatter: function (params) {
                const param_name = params.name;
                const values = params.value;
                let tooltipText = `<strong>${param_name}</strong><br/>`;

                radarIndicators.forEach((indicator, index) => {
                tooltipText += `${indicator.name}: ⭐ ${values[index]}<br/>`;
                });

                return tooltipText;
            }
        },
        series: [{
            name: 'Genre Preferences',
            type: 'radar',
            data: [
                {
                    value: radarAllTaste,
                    name: 'Average Taste',
                    itemStyle: {
                        color: '#9ac0c9'  // Farbe der Fläche
                    },
                    lineStyle: {
                        color: '#9ac0c9'  // Randlinie
                    },
                    areaStyle: {
                        opacity: 0.3
                    }
                },
                {
                    value: [5,4.5,3,3.8,4,1.5,5,3,2.5,3.5],
                    name: 'My Taste',
                    itemStyle: {
                        color: '#a3c4a5'
                    },
                    lineStyle: {
                        color: '#a3c4a5'
                    },
                    areaStyle: {
                        opacity: 0.3
                    }
                }
            ]
        }]
    };

    // sunburst
    $: topGenresLibrary = Object.keys(userGenreCounts);

    const categoryGroups = {
        "Fiction": ['Fiction', 'Juvenile Fiction', 'Juvenile Nonfiction', 'Drama', 'Poetry', 'Humor', 'Comics & Graphic Novels'],
        "Arts & Leisure Time": ['Literary Criticism', 'Computers', 'Cooking', 'Performing Arts', 'Travel', 'Art', 'Literary Collections'],
        "Guides": ['Family & Relationships', 'Body, Mind & Spirit', 'Language Arts & Disciplines', 'Business & Economics', 'Health & Fitness', 'Self-Help'],
        "Non-Fiction": ['Social Science', 'Religion', 'Science', 'History', 'Psychology', 'Philosophy', 'Political Science', 'Biography & Autobiography']
    }

    function getColorByLibraryCount(count, max) {
        const alpha = max > 0 ? Math.min(1, count / max) : 0;
        return `rgba(163, 196, 165, ${alpha.toFixed(2)})`; // #A3BE8C mit Transparenz
    }

    $: sunburstData = Object.entries(categoryGroups).map(([groupName, groupCategories]) => {
        const groupLibraryCount = groupCategories.reduce((sum, category) => {
            return sum + (userGenreCounts[category] || 0);
        }, 0);

        const children = groupCategories.map(category => {
            const globalCount = genreCounts[category] || 0;
            const libraryCount = userGenreCounts[category] || 0;

            return {
                name: category,
                value: globalCount,
                itemStyle: {
                    color: getColorByLibraryCount(libraryCount, groupLibraryCount) // Relativ zur Gruppe
                }
            };
        });

        return {
            name: groupName,
            children,
            itemStyle: {
                color: getColorByLibraryCount(groupLibraryCount, topGenresLibrary.length) // Relativ zur Gesamtzahl Gruppen
            }
        };
    });

    $: option_sunburst = {
        title: {
            text: 'Distribution of all Books in my Library',
            left: 'center',
            top: '12px',
            textStyle: {
                align: 'center',
                color: '#3a4d3b',
                fontFamily: 'Arial',
                align: 'center',
                fontSize: '0.7em',
                letterSpacing: '1px'
            }
        },
        series: {
            type: 'sunburst',
            center: ['50%', '55%'], // weiter unten
            radius: [0, '90%'],
            data: sunburstData,
            levels: [
            {},
            {
                r0: '0%',
                r: '60%',
                label: {
                    fontSize: 11,
                    color: '#3a4d3b',
                    fontFamily: 'Coolvetica Rg, Arial',
                    rotate: 'radial'
                }
            },
            {
                r0: '60%',
                r: '85%',
                label: {
                fontSize: 10,
                color: '#3a4d3b',
                fontFamily: 'Coolvetica Rg, Arial',
                align: 'left',
                rotate: 0,
                show: false
                }
            }
            ],
        },
        tooltip: {
            position: function (point, params, dom, rect, size) {
                return ['80%', '5%']; // [left, top] 
            },
            trigger: 'item',
            textStyle: {
                fontFamily: 'Coolvetica Rg, Arial',
                fontSize: 13,
                color: '#3a4d3b'
            },
            formatter: function (params) {
                const name = params.name;
                const value = params.value;

                let libraryCount = 0;
                let max = 0;

                if (params.data.children) {
                // Innerer Ring (Gruppe)
                const children = params.data.children;
                libraryCount = children.reduce((sum, child) => sum + (userGenreCounts[child.name] || 0), 0);
                max = children.reduce((sum, child) => sum + (genreCounts[child.name] || 0), 0);
                } else {
                // Äußerer Ring (Genre)
                libraryCount = userGenreCounts[name] || 0;
                max = genreCounts[name] || 0;
                }

                const percent = max > 0 ? Math.round((libraryCount / max) * 100) : 0;

                // Balken-HTML
                const bar = `
                <div style="width: 100px; height: 8px; background: #eee; border-radius: 4px; overflow: hidden; margin-top: 4px;">
                    <div style="width: ${percent}%; height: 100%; background: #A3BE8C;"></div>
                </div>
                `;

                return `
                <strong>${name}</strong><br/>
                Available: ${value}<br/>
                In Library: ${libraryCount} (${percent}%)<br/>
                ${bar}
                `;
            }
        }

    };

    // genre dropdown
    let dropdownOpen = false;
    let dropdownRef;

    function toggleDropdown() {
        dropdownOpen = !dropdownOpen;
    }

    function closeDropdown() {
        dropdownOpen = false;
    }

    function handleClickOutside(event) {
        if (dropdownRef && !dropdownRef.contains(event.target)) {
            closeDropdown();
        }
    }

    onMount(() => {
        if (browser) {
            window.addEventListener('click', handleClickOutside);
        }

        return () => {
            if (browser) {
                window.removeEventListener('click', handleClickOutside);
            }
        };
    });

</script>

<Navbar>
    <div slot="slider">
        <div class="slider-container">
            <div class="w-full md:w-37.5 dropdown-container relative" bind:this={dropdownRef}>
                <button
                    class="w-full bg-[#fffefc] border border-[#a3c4a5] rounded-lg px-4 py-2 text-left"
                    on:click={toggleDropdown}
                    style="font-family: 'Coolvetica Rg Cond', Arial; letter-spacing: 1px; font-size: 0.9em;"
                    >
                    {localGenreArray.length > 0 ? localGenreArray.join(', ') : 'Filter Genres'}
                </button>
                {#if dropdownOpen}
                    <div class="absolute z-10 mt-2 w-full bg-white border border-[#a3c4a5] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {#each genres as genre}
                        <label class="flex items-center px-4 py-2 hover:bg-[#f0f0f0]" style="font-family: 'Coolvetica Rg', Arial; letter-spacing: 1.5px; font-size: 0.8em;">
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
                {/if}
            </div>
            <div class="slider">
                <DoubleRangeSlider 
                bind:start
                bind:end
                {minPublishedYear}
                {maxPublishedYear}
                />
                <div class="labels">
                <div class="label">{minPublishedYear}</div>
                <div class="label">{maxPublishedYear}</div>
                </div>
            </div>
        </div>
    </div>
</Navbar>

<div class="flex px-4 mt-16">

    <aside class="w-100 min-h-[500px] bg-[#f7f7f4] rounded-lg shadow-md p-5 mr-4 flex flex-col items-start">
        <div class="w-full h-full mb-5">
            <Chart {init} options={option_radar} />
        </div>

        <div class="w-full h-full">
            <Chart {init} options={option_sunburst} />
        </div>
    </aside>

    <div class="flex-1">
        <Tabs tabStyle="pill">

            <!-- Filter -->
            <div class="w-full flex flex-col md:flex-row items-start gap-1 px-2 pt-2 bg-[#f7f7f4] rounded-lg shadow-md">
                <div class="w-100 mr-5 mt-1">
                    <Tooltip class="bg-[#fffefc] text-[#a3c4a5] px-3 py-2 rounded shadow-lg ease-in-out border border-[#a3c4a5]"
                            style="font-family: 'Coolvetica Rg', Arial; letter-spacing: 1.2px; font-size: 0.8em;"
                            animation="duration-200">
                    Search by title, author or ISBN</Tooltip>
                    <Search
                        size="sm"
                        bind:value={localSearch}
                        placeholder="Search books"
                        inputClass="w-full focus:ring-[#a3c4a5] focus:border-[#a3c4a5] bg-[#fffefc] placeholder-gray-400"
                        style="font-family: 'Coolvetica Rg', Arial; letter-spacing: 1.5px; font-size: 0.8em;"
                    >
                    </Search>
                </div>

                <div class="rating-filter w-40 mr-5 mt-1">
                    <label for="rating" style="font-size: larger; margin-right: -2px;">
                        ★
                    </label>
                    <select
                        id="rating"
                        bind:value={minRating}
                        class="no-arrow border border-[#a3c4a5] rounded px-2 py-1 text-sm bg-[#fffefc]"
                        style="font-family: 'Coolvetica Rg', Arial;"
                    >
                        <option value="0" selected>-</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                        <option value="5">5</option>
                    </select>
                </div>

                <!-- Seitenzahl-Filter -->
                <div class="w-full md:w-1/2" style="margin-left:-60px;">
                    <div class="mb-0" style="font-family: Coolvetica Rg Cond, Arial; letter-spacing: 1px; font-size: 0.9em;">{maxPagesFilter} pages or less</div>
                    <input type="range" min="0" max={maxPages} step="10" bind:value={maxPagesFilter} class="w-full accent-[#a3c4a5]" />
                </div>
            </div>

            <TabItem
                title="All Books"
                open
                activeClass="bg-[#a3c4a5]/90 text-white min-w-[120px] h-[60px] flex flex-col items-center justify-center rounded-lg"
                inactiveClass="bg-[#fffefc] text-[#3a4d3b] hover:text-white hover:bg-[#a3c4a5] min-w-[120px] h-[60px] flex flex-col items-center justify-center rounded-lg transition-colors duration-200 ease-in-out"
                style="font-family: 'Coolvetica Rg', Arial;"
            >
                <div class="scrollable-tab-content">
                    <div class="grid grid-cols-9 gap-2 items-center p-2">
                        {#each localFilteredBooks.slice(0, 100) as book}
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
                inactiveClass="bg-[#fffefc] text-[#3a4d3b] hover:text-white hover:bg-[#a3c4a5] min-w-[120px] h-[60px] flex flex-col items-center justify-center rounded-lg transition-colors duration-200 ease-in-out"
                style="font-family: 'Coolvetica Rg', Arial;"
            >
                <div class="scrollable-tab-content">
                    <div class="grid grid-cols-9 gap-1 items-center p-4">
                        {#each localFilteredBooks.filter(book => myLibrary.includes(book.isbn13)) as book}
                            <div class="w-full h-35">
                                <BookComponent {book} index={100} onOpenSidebar={openSidebar} />
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
        height: 560px;
        overflow-y: auto;
        background-color: #fffefc;
    }
    
    .slider {
        width: 25vw;
        margin: 0 auto;
        text-align: center;
    }

    .slider-container {
        display: flex;
        align-items: center;
        gap: 1rem; /* Abstand zwischen Dropdown und Slider */
        width: 35vw;
    }

    .label:first-child {
        float: left;
        font-family: Coolvetica Rg Cond, Arial;
        letter-spacing: 2px;
        font-size: 10;
    }

    .label:last-child {
        float: right;
        font-family: Coolvetica Rg Cond, Arial;
        letter-spacing: 2px;
        font-size: 10;
    }

    .no-arrow {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        background-image: none;
     }

</style>