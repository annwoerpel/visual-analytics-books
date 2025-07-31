<script>
  import { Chart } from 'svelte-echarts'
  import { init, use } from 'echarts/core'
  import { ScatterChart, RadarChart, LineChart } from 'echarts/charts'
  import { GridComponent, LegendComponent, TitleComponent, ToolboxComponent, TooltipComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'
  import { UniversalTransition } from 'echarts/features'

  import { Banner, Button, Dropdown, DropdownDivider, DropdownItem, Select, Label } from "flowbite-svelte";

  import DoubleRangeSlider from './DoubleRangeSlider.svelte';
  import BookComponent from './BookComponent.svelte';
  import BookSidebar from './BookSidebar.svelte';
  import ColorBlob from './ColorBlob.svelte';
  import Navbar from "./Navbar.svelte";

  export let data;
  let books = data.books ?? [];

  // Initialbereich: 1970–2020
  let start = 1970;
  let end = 2020;

  // Dynamische Jahrgrenzen
  let minPublishedYear = 1900;
  let maxPublishedYear = 2025;

  // Reaktiv: min/max aus Daten berechnen
  $: if (books.length > 0) {
    const allYears = books
      .map(b => parseInt(b.published_year))
      .filter(y => !isNaN(y));
    minPublishedYear = Math.min(...allYears);
    maxPublishedYear = Math.max(...allYears);
  }

  // Top 10 Bücher im aktuellen Intervall und im aktuellen Genre
  $: top_10_books = books
    .filter(book =>
      book.average_rating &&
      book.ratings_count &&
      book.published_year >= start &&
      book.published_year <= end &&
      (selectedGenre === "All Genres" || book.categories?.split(',').map(c => c.trim()).includes(selectedGenre))
    )
    .sort((a, b) => {
      const scoreA = a.average_rating * Math.log10(a.ratings_count + 1);
      const scoreB = b.average_rating * Math.log10(b.ratings_count + 1);
      return scoreB - scoreA;
    })
    .slice(0, 10);

  // Top 10 Autoren
  $: top_10_authors = Array.from(new Set(
    top_10_books.map(book => book.authors)
  )).slice(0, 10);

  // Top 5 Cover-Farben
  $: top_10_colors = Array.from(new Set(
    top_10_books.map(book => book.dominant_color)
  )).slice(0, 5);

  let selectedBook = null;
  function openSidebar(book) {
    selectedBook = book;
  }
  function closeSidebar() {
    selectedBook = null;
  }

  $: genreYearCounts = {}; 
  $: books.forEach(b => {
    const year = parseInt(b.published_year);
    const genres = b.categories?.split(',').map(c => c.trim()) ?? [];
    if (!isNaN(year)) {
      genres.forEach(g => {
        if (!genreYearCounts[g]) genreYearCounts[g] = {};
        genreYearCounts[g][year] = (genreYearCounts[g][year] || 0) + 1;
      });
    }
  });

  let selectedGenre = "All Genres"; // leeres Feld zeigt alle
  let showDropdown = false;
  // Referenz auf das Dropdown-Element
  let dropdownRef;

  function selectGenre(genre) {
    selectedGenre = genre;
    showDropdown = false;
  }

  // Listener bei Mount setzen
  import { onMount, onDestroy } from 'svelte';

  function handleClickOutside(event) {
    if (dropdownRef && !dropdownRef.contains(event.target)) {
      showDropdown = false;
    }
  }

  onMount(() => {
    window.addEventListener('click', handleClickOutside);
  });

  onDestroy(() => {
    window.removeEventListener('click', handleClickOutside);
  });

  $: topGenresByCount = Object.entries(genreYearCounts)
    .sort((a, b) => {
      const totalA = Object.values(a[1]).reduce((sum, v) => sum + v, 0);
      const totalB = Object.values(b[1]).reduce((sum, v) => sum + v, 0);
      return totalB - totalA;
    })
    .slice(0, 5)
    .map(([genre]) => genre);

  $: stackedYears = Array.from(new Set(
    books
      .map(b => parseInt(b.published_year))
      .filter(y => !isNaN(y) && y >= start && y <= end)
  )).sort((a, b) => a - b);

  $: stackedAreaSeries = topGenresByCount.map(genre => {
    const yearData = stackedYears.map(y => genreYearCounts[genre]?.[y] || 0);
    return {
      name: genre,
      type: 'line',
      stack: 'total',
      areaStyle: {},
      emphasis: { focus: 'series' },
      data: yearData
    };
  });

  use([ScatterChart, RadarChart, GridComponent, CanvasRenderer, TitleComponent, ToolboxComponent, TooltipComponent, LegendComponent, LineChart, UniversalTransition]);

  $: scatterData = top_10_books.map((book) => ({
      value: [parseInt(book.published_year), 3],
      symbol: `image://${book.thumbnail}`
    }));

  $: top_10_years = top_10_books
    .map(b => parseInt(b.published_year))
    .filter(y => !isNaN(y));

  $: minYear = Math.min(...top_10_years);
  $: maxYear = Math.max(...top_10_years);

  const xRange = end - start + 1;
  const maxLabels = 10;
  const interval = Math.ceil(xRange / maxLabels);

  $: scatterChartOptions = {
    grid: {
      bottom: 0,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    xAxis: {
      min: minYear,
      max: maxYear,
      interval: Math.ceil((maxYear - minYear + 1) / 10),
      axisLabel: { formatter: v => v }
    },
    yAxis: {
      min: 1,
      max: 5,
      inverse: true,
      interval: 1,
      show: false
    },
    series: [{
      type: 'scatter',
      data: scatterData,
      symbolSize: () => [68, 110],
      symbolOffset: [0, 0]
    }]
  };


  // Stacked Area Chart Konfiguration
  $: stackedAreaChartOptions = {
    title: { text: 'Amount of Publications' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: topGenresByCount, bottom: 0 },
    toolbox: { feature: { saveAsImage: {} } },
    grid: { left: '3%', right: '4%', bottom: '8%', containLabel: true },
    xAxis: [{ type: 'category', boundaryGap: false, data: stackedYears }],
    yAxis: [{ type: 'value' }],
    series: stackedAreaSeries
  };

  // Bump Chart Konfiguration
  $: bumpYears = [];
  $: {
    const span = end - start;
    const step = Math.max(1, Math.floor(span / 9)); // 9 Schritte → 10 Werte

    let tempYears = [];
    for (let i = 0; i < 10; i++) {
      const y = end - i * step;
      if (y < start) break;
      tempYears.push(Math.round(y));
    }

    bumpYears = tempYears.sort((a, b) => a - b).map(String); // Chronologisch sortieren
  }

  function computeGenreRanksForTopGenres(genres, years) {
    const genreScores = new Map();

    genres.forEach(g => genreScores.set(g, []));

    years.forEach((yearStr, index) => {
      const year = parseInt(yearStr);
      const scores = genres.map(g => {
        const relevantBooks = books.filter(b =>
          parseInt(b.published_year) === year &&
          b.categories?.split(',').map(c => c.trim()).includes(g)
        );
        const score = relevantBooks.length > 0
          ? relevantBooks
              .map(b => parseFloat(b.average_rating) * Math.log10(parseFloat(b.ratings_count || 1)))
              .filter(s => !isNaN(s))
              .reduce((a, b) => a + b, 0) / relevantBooks.length
          : null;
        return { genre: g, score };
      }).filter(s => s.score !== null);

      // Sortiere nach Score
      scores.sort((a, b) => b.score - a.score);

      scores.forEach((entry, i) => {
        const list = genreScores.get(entry.genre);
        list.push(i + 1);
        genreScores.set(entry.genre, list);
      });

      // Null für andere Jahre auffüllen
      genres.forEach(g => {
        const arr = genreScores.get(g);
        if (arr.length < index + 1) arr.push(null);
      });
    });

    return genreScores;
  }

  $: top5GenresOverall = Object.entries(genreYearCounts)
    .map(([genre, yearData]) => {
      const count = Object.values(yearData).reduce((sum, v) => sum + v, 0);
      return { genre, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(g => g.genre);

  $: genreRanks = computeGenreRanksForTopGenres(top5GenresOverall, bumpYears);

  $: bumpSeriesList = Array.from(genreRanks.entries()).map(([genre, ranks]) => ({
    name: genre,
    type: 'line',
    data: ranks,
    smooth: false,
    connectNulls: false,
    symbolSize: 10,
    endLabel: {
      show: true,
      formatter: genre,
      distance: 10
    },
    lineStyle: { width: 3 },
    connectNulls: true
  }));

 $: bumpChartOptions = {
    labelLayout: {
      hideOverlap: true,
      moveOverlap: true
    },
    title: { text: 'Genre Popularity' },
    tooltip: { trigger: 'item' },
    grid: {
      left: 30,
      right: 110,
      bottom: 40,
      containLabel: true
    },
    legend: { show: true, bottom: 0 },
    toolbox: { feature: { saveAsImage: {} } },
    xAxis: {
      type: 'category',
      splitLine: {
      show: true
    },
      boundaryGap: false,
      axisLabel: { fontSize: 14 },
      data: bumpYears
    },
    yAxis: {
      type: 'value',
      inverse: true,
      interval: 1,
      min: 1,
      max: topGenresByCount.length,
      axisLabel: {
        formatter: '#{value}',
        fontSize: 14
      }
    },
    series: bumpSeriesList
  };
</script>

<Navbar>
  <div slot="slider">
    <div class="slider">
      <DoubleRangeSlider 
        bind:start
        bind:end
        {minPublishedYear}
        {maxPublishedYear}
      />
      <div class="labels">
        <div class="label">{start}</div>
        <div class="label">{end}</div>
      </div>
    </div>
  </div>
</Navbar>

<div class="flex flex-row justify-center items-start gap-3 px-4 mt-12">
  <main>

    <div class="dropdown" bind:this={dropdownRef}>
      {#if showDropdown}
        <div class="dropdown-list down">
          {#each ["All Genres", ...top5GenresOverall] as genre}
            <button
              class="item {selectedGenre === genre ? 'active' : ''}"
              on:click={() => selectGenre(genre)}>
              {genre}
            </button>
          {/each}
        </div>
      {/if}

      <button on:click={() => showDropdown = !showDropdown}>
        {selectedGenre}
      </button>
    </div>

    <h1>Top 10 Books</h1>
    <div class="grid grid-cols-5 gap-1 items-center p-4">
      {#each top_10_books as book, i}
        <div class="w-full h-32">
          <BookComponent {book} index={i} onOpenSidebar={openSidebar} />
        </div>
      {/each}
    </div>

    <h1>Top 10 Authors</h1>
      <div class="p-4">
        {#each top_10_authors as author}
          <p>{author}</p>
        {/each}
      </div>

    <h1>Top 5 Cover Colors</h1>
    <div class="grid grid-cols-5 gap-1 items-center p-4">
      {#each top_10_colors as color}
        <ColorBlob color={color} size={60} />
      {/each}
    </div>

  </main>

  <div class="graph">
    <Chart class="-mt-10" {init} options={scatterChartOptions} />
  </div>

</div>

<div class="graph-2">
  <Chart {init} options={stackedAreaChartOptions} />
</div>

<div class="graph-2">
  <Chart {init} options={bumpChartOptions} />
</div>



<BookSidebar book={selectedBook} onClose={closeSidebar} />

<style>
  @font-face { font-family:Milkyway; src: url('/fonts/Milkyway.ttf'); }
  @font-face { font-family:Coolvetica Rg; src: url('/fonts/Coolvetica Rg.otf'); }
  @font-face { font-family:Coolvetica Rg Cond; src: url('/fonts/Coolvetica Rg Cond.otf'); }


  .graph {
    width: 80vw;
    height: 28vh;
    background-color: #fffefc;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin: 0 auto;
    margin-top: 20px;
  }

  .graph-2 {
    width: 70vw;
    height: 50vh;
    background-color: #fffefc;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin: 0 auto;
    margin-top: 20px;
  }

  .slider {
    width: 35vw;
    margin: 0 auto;
    text-align: center;
  }

  main {
    text-align: center;
    padding: 1em;
    width: 540px;
    background-color: #fffefc;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-top: 20px;
  }

  h1 {
    font-family: Coolvetica Rg Cond, Arial;
    letter-spacing: 2px;
    font-size: 1.7em;
    font-weight: normal;
    text-align: center;
    margin: 0;
    color: rgba(0, 0, 0, 0.8);
    margin-top: 10px;
    margin-bottom: -10px;
  }

  .label:first-child {
    float: left;
  }

  .label:last-child {
    float: right;
  }

  .dropdown {
    position: relative;
    display: inline-block;
    text-align: right;
    background-color: rgb(216, 216, 216);
  }

  .dropdown-list.down {
    position: absolute;
    top: 100%;
    left: 0;
    background: white;
    border: 1px solid #ccc;
    width: 150px;
    z-index: 10;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 6px;
  }

  .item {
    padding: 8px;
    width: 100%;
    text-align: center;
    cursor: pointer;
  }

  .item:hover {
    background: #eee;
  }

  .active {
    font-weight: bold;
    background: #ddd;
  }

</style>
