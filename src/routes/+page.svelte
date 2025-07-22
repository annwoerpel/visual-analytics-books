<script>
  import { Chart } from 'svelte-echarts'
  import { init, use } from 'echarts/core'
  import { ScatterChart, RadarChart } from 'echarts/charts'
  import { GridComponent, TitleComponent } from 'echarts/components'
  import { CanvasRenderer } from 'echarts/renderers'

  import DoubleRangeSlider from './DoubleRangeSlider.svelte';
  import BookComponent from './BookComponent.svelte';
  import BookSidebar from './BookSidebar.svelte';
  import { reverse } from 'd3-array';

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

  // Top 10 Bücher im aktuellen Intervall
  $: top_10_books = books
    .filter(book =>
      book.average_rating &&
      book.ratings_count &&
      book.published_year >= start &&
      book.published_year <= end
    )
    .sort((a, b) => {
      const scoreA = a.average_rating * Math.log10(a.ratings_count + 1);
      const scoreB = b.average_rating * Math.log10(b.ratings_count + 1);
      return scoreB - scoreA;
    })
    .slice(0, 10);

  let selectedBook = null;
  function openSidebar(book) {
    selectedBook = book;
  }
  function closeSidebar() {
    selectedBook = null;
  }

  use([ScatterChart, RadarChart, GridComponent, CanvasRenderer, TitleComponent]);

  $: scatterData = top_10_books.map((book, i) => ({
    value: [parseInt(book.published_year), i + 1],
    symbol: `image://${book.thumbnail}`
  }));

  $: options = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    xAxis: {
      min: Math.max(start - 1, minPublishedYear),
      max: Math.min(end + 1, maxPublishedYear),
      interval: 1,
      axisLabel: { formatter: v => v }
    },
    yAxis: {
      min: 1,
      max: 10,
      inverse: true,
      interval: 1
    },
    series: [{
      type: 'scatter',
      data: scatterData,
      symbolSize: () => [60, 90]
    }]
  };
</script>

<div class="flex flex-row justify-center items-start gap-3 px-4">
  <main>
    <h1>TOP 10 BOOKS</h1>

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
    

    <div class="grid grid-cols-5 gap-1 mt-7 items-center p-4">
      {#each top_10_books as book, i}
        <div class="w-full h-32">
          <BookComponent {book} index={i} onOpenSidebar={openSidebar} />
        </div>
      {/each}
    </div>

  </main>

  <div class="graph">
    <Chart {init} {options} />
  </div>
</div>


<BookSidebar book={selectedBook} onClose={closeSidebar} />

<style>
  @font-face { font-family:Milkyway; src: url('/fonts/Milkyway.ttf'); }
  @font-face { font-family:Coolvetica Rg; src: url('/fonts/Coolvetica Rg.otf'); }
  @font-face { font-family:Coolvetica Rg Cond; src: url('/fonts/Coolvetica Rg Cond.otf'); }

  .graph {
    width: 70vw;
    height: 50vh;
    background-color: #fffefc;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin: 0 auto;
    margin-top: 20px;
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
  }

  .label:first-child {
    float: left;
  }

  .label:last-child {
    float: right;
  }

</style>
