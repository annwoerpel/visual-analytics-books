<script>
  import WordCloud from "./WordCloud.svelte";

  import { Chart } from 'svelte-echarts';
  import { init, use } from 'echarts/core';
  import { ScatterChart, RadarChart, LineChart, BarChart, GraphChart } from 'echarts/charts';
  import { GridComponent, LegendComponent, TitleComponent, ToolboxComponent, TooltipComponent } from 'echarts/components';
  import { CanvasRenderer } from 'echarts/renderers';
  import { UniversalTransition } from 'echarts/features';

  import { Banner, Button, Dropdown, DropdownDivider, DropdownItem, Select, Label } from "flowbite-svelte";

  import DoubleRangeSlider from './DoubleRangeSlider.svelte';
  import BookComponent from './BookComponent.svelte';
  import BookSidebar from './BookSidebar.svelte';
  import ColorBlob from './ColorBlob.svelte';
  import Navbar from "./Navbar.svelte";

   import GenreDropdown from './GenreDropdown.svelte';

  let localGenreArray = [];

  function toggleGenre(genre) {
      if (localGenreArray.includes(genre)) {
        localGenreArray = localGenreArray.filter(g => g !== genre);
      } else {
        localGenreArray = [...localGenreArray, genre];
      }
  }

  export let data;
  let books = data.books ?? [];

  let start = 1876;
  let end = 2019;

  let minPublishedYear = 1876;
  let maxPublishedYear = 2019;

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
    (
      localGenreArray.length === 0 || // Alle Genres erlaubt
      book.categories?.split(',').map(c => c.trim()).some(g => localGenreArray.includes(g))
    )
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
  
  $: wordCloudText = top_10_authors
    .map((author, index) =>
      Array(10 - index).fill(author.replace(/\s/g, "_")).join(" ")
    )
    .join(" ");

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

  let selectedGenre = "All Genres";
  let showDropdown = false;
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

  use([ScatterChart, RadarChart, GridComponent, CanvasRenderer, TitleComponent, ToolboxComponent, TooltipComponent, LegendComponent, LineChart, UniversalTransition, BarChart, GraphChart]);

  $: scatterData = [];

  $: {
    const yearGroups = {};

    top_10_books.forEach((book, index) => {
      const year = parseInt(book.published_year);
      if (!yearGroups[year]) yearGroups[year] = [];
      yearGroups[year].push({ book, rank: index + 1 });
    });

    scatterData = Object.entries(yearGroups).flatMap(([year, group]) => {
      const center = parseInt(year);
      const spread = 2; // Gesamtbreite der Streuung
      const step = group.length > 1 ? spread / (group.length - 1) : 0;

      return group.map((entry, i) => {
        const offset = -spread / 2 + i * step;
        return {
          value: [center + offset, 3], // X gestreut, Y konstant
          symbol: `image://${entry.book.thumbnail}`,
          book: entry.book,
          rank: entry.rank
        };
      });
    });
  }

  $: top_10_years = top_10_books
    .map(b => parseInt(b.published_year))
    .filter(y => !isNaN(y));

  $: minYear = Math.min(...top_10_years);
  $: maxYear = Math.max(...top_10_years);

  const xRange = end - start + 1;
  const maxLabels = 10;
  const interval = Math.ceil(xRange / maxLabels);

  $: scatterChartOptions = {
    toolbox: { feature: { saveAsImage: {} } },
    grid: {
      bottom: 0,
      containLabel: true
    },
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        const book = params.data.book;
        const rank = params.data.rank;
        const title = book.title;
        const author = book.authors;
        const year = book.published_year;

        return `
          <strong>#${rank}</strong><br/>
          <em>${title}</em><br/>
          by ${author}<br/>
          Published: ${year}
        `;
      }
    },
    xAxis: {
      min: minYear - 1,
      max: maxYear + 1,
      interval: Math.ceil((maxYear - minYear + 1) / 10),
      axisLabel: { formatter: v => Math.floor(v) }
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
      symbolOffset: [0, 0],
      itemStyle: {
        opacity: 1 // volle Sichtbarkeit
      }
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
  
  $: top10GenresOverall = Object.entries(genreYearCounts)
    .map(([genre, yearData]) => {
      const count = Object.values(yearData).reduce((sum, v) => sum + v, 0);
      return { genre, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(g => g.genre);

  $: allGenres = Object.entries(genreYearCounts)
    .map(([genre, yearData]) => {
      const count = Object.values(yearData).reduce((sum, v) => sum + v, 0);
      return { genre, count };
    })
    .sort((a, b) => b.count - a.count)
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


// Bar + Line Chart
const groupedByYear = {};

books.forEach(book => {
  const year = parseInt(book.published_year);
  const rating = parseFloat(book.average_rating);
  const genres = book.categories?.split(',').map(g => g.trim()) ?? [];

  if (!groupedByYear[year]) {
    groupedByYear[year] = { ratings: [], genreRatings: {} };
  }

  groupedByYear[year].ratings.push(rating);

  genres.forEach(genre => {
    if (!groupedByYear[year].genreRatings[genre]) {
      groupedByYear[year].genreRatings[genre] = [];
    }
    groupedByYear[year].genreRatings[genre].push(rating);
  });
});

const barLineChartData = Object.entries(groupedByYear).map(([year, data]) => {
  const avgRating =
    data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length;

  const genreAverages = Object.entries(data.genreRatings).map(([genre, ratings]) => ({
    genre,
    avg: ratings.reduce((a, b) => a + b, 0) / ratings.length
  }));

  const sortedGenres = genreAverages.sort((a, b) => b.avg - a.avg);
  const bestGenre = sortedGenres[0] ?? { genre: 'N/A', avg: 0 };
  const worstGenre = sortedGenres[sortedGenres.length - 1] ?? { genre: 'N/A', avg: 0 };

  return {
    year: parseInt(year),
    avgRating,
    bestGenreRating: bestGenre.avg,
    bestGenreName: bestGenre.genre,
    worstGenreRating: worstGenre.avg,
    worstGenreName: worstGenre.genre
  };
});

$: filteredBarLineChartData = barLineChartData.filter(d => d.year >= start && d.year <= end);

$: barLineChartOptions = {
  toolbox: { feature: { saveAsImage: {} } },
  title: {
    text: "Average Rating over Time"
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'cross' },
    formatter: function (params) {
      const year = params[0].axisValue;
      const data = filteredBarLineChartData.find(d => d.year === parseInt(year));
      if (!data) return '';

      return `
        <strong>${year}</strong><br/>
        Avg Rating: ${data.avgRating.toFixed(2)}<br/>
        Best Genre: ${data.bestGenreName} (${data.bestGenreRating.toFixed(2)})<br/>
        Worst Genre: ${data.worstGenreName} (${data.worstGenreRating.toFixed(2)})
      `;
    }
  },
  legend: {
    data: ['Avg Rating', 'Best Genre', 'Worst Genre']
  },
  xAxis: {
    type: 'category',
    data: filteredBarLineChartData.map(d => d.year),
    axisLabel: { formatter: '{value}' }
  },
  yAxis: {
    type: 'value',
    min: 3,
    max: 5,
    interval: 0.5,
    axisLabel: { formatter: '{value} ★' }
  },
  series: [
    {
      name: 'Best Genre',
      type: 'bar',
      data: filteredBarLineChartData.map(d => d.bestGenreRating),
      itemStyle: { color: '#a3c4a5' }
    },
    {
      name: 'Worst Genre',
      type: 'bar',
      data: filteredBarLineChartData.map(d => d.worstGenreRating),
      itemStyle: { color: '#f2b5b5' }
    },
    {
      name: 'Avg Rating',
      type: 'line',
      showSymbol: false,
      data: filteredBarLineChartData.map(d => d.avgRating),
      lineStyle: { color: '#3a4d3b' }
    }
  ]
};

// Graph Chart
$: authorCountPerGenre = {};

$: books.forEach(book => {
  const author = book.authors?.trim();
  const genre = book.categories?.trim();

  if (!author || !genre || !top10GenresOverall.includes(genre)) return;

  if (!authorCountPerGenre[genre]) {
    authorCountPerGenre[genre] = new Set();
  }

  authorCountPerGenre[genre].add(author);
});

$: filteredBooksByTopGenres = books.filter(book =>
  top10GenresOverall.includes(book.categories?.trim())
);

$: genreLinksMap = (() => {
  const map = {};
  const genreSet = new Set();

  const authorGenresMap = {};

  filteredBooksByTopGenres.forEach(book => {
    const author = book.authors?.trim();
    const genre = book.categories?.trim();

    if (!author || !genre) return;

    if (!authorGenresMap[author]) {
      authorGenresMap[author] = new Set();
    }

    authorGenresMap[author].add(genre);
    genreSet.add(genre);
  });

  Object.values(authorGenresMap).forEach(genreSetForAuthor => {
    const genres = Array.from(genreSetForAuthor);
    for (let i = 0; i < genres.length; i++) {
      for (let j = i + 1; j < genres.length; j++) {
        const g1 = genres[i];
        const g2 = genres[j];
        const key = [g1, g2].sort().join('↔');

        if (!map[key]) map[key] = 0;
        map[key]++;
      }
    }
  });

  return { map, genreSet };
})();

$: graphNodes = top10GenresOverall.map(genre => {
  const authorCount = authorCountPerGenre[genre]?.size || 0;
  return {
    id: genre,
    name: genre,
    category: 0,
    symbolSize: Math.sqrt(authorCount)
  };
});

$: graphLinks = Object.entries(genreLinksMap.map).map(([key, value]) => {
  const [source, target] = key.split('↔');
  return {
    source,
    target,
    value,
    lineStyle: {
      width: Math.min(value, 5),
      opacity: 0.6
    }
  };
});

$: graphChartOptions = {
  toolbox: { feature: { saveAsImage: {} } },
  title: {
    text: 'Authors per Genre'
  },
  tooltip: {
    formatter: function (params) {
      if (params.dataType === 'node') {
        const count = authorCountPerGenre[params.data.name]?.size || 0;
        return `${params.data.name}<br/>Authors in this Genre: ${count}`;
      }
      if (params.dataType === 'edge') {
        return `${params.data.source} ↔ ${params.data.target}<br/>Matching Authors: ${params.data.value}`;
      }
    }
  },
  series: [
    {
      type: 'graph',
      layout: 'circular',
      circular: { rotateLabel: false },
      data: graphNodes,
      links: graphLinks,
      center: ['50%', '50%'],
      radius: '80%',          
      roam: true,
      label: { show: false },
      emphasis: { label: { show: false } },
      lineStyle: {
        color: 'source',
        curveness: 0.2
      }
    }
  ]
};


// Color Bubble Chart
function parseRGB(rgbString) {
  if (!rgbString || typeof rgbString !== 'string') return [0, 0, 0];

  const [r, g, b] = rgbString
    .replace(/[^\d,]/g, '')
    .split(',')
    .map(x => parseInt(x));
  return [r, g, b];
}

function getColorCentroids(colors, k =10) {
  // colors: Array of [r, g, b]
  const centroids = colors.slice(0, k); // naive Start
  const assignments = new Array(colors.length).fill(0);

  for (let iter = 0; iter < 10; iter++) {
    // Zuweisung
    colors.forEach((color, i) => {
      let minDist = Infinity;
      let best = 0;
      centroids.forEach((c, j) => {
        const dist = Math.sqrt(
          (color[0] - c[0]) ** 2 +
          (color[1] - c[1]) ** 2 +
          (color[2] - c[2]) ** 2
        );
        if (dist < minDist) {
          minDist = dist;
          best = j;
        }
      });
      assignments[i] = best;
    });

    // Neue Zentren
    const sums = Array(k).fill().map(() => [0, 0, 0]);
    const counts = Array(k).fill(0);

    colors.forEach((color, i) => {
      const cluster = assignments[i];
      sums[cluster][0] += color[0];
      sums[cluster][1] += color[1];
      sums[cluster][2] += color[2];
      counts[cluster]++;
    });

    centroids.forEach((_, j) => {
      if (counts[j] > 0) {
        centroids[j] = [
          Math.round(sums[j][0] / counts[j]),
          Math.round(sums[j][1] / counts[j]),
          Math.round(sums[j][2] / counts[j])
        ];
      }
    });
  }

  return { centroids, assignments };
}

const rgbVectors = books
  .map(book => parseRGB(book.dominant_color))
  .filter(v => v.length === 3);

const { centroids, assignments } = getColorCentroids(rgbVectors, 10);

const clusterCounts = Array(10).fill(0);
assignments.forEach(i => clusterCounts[i]++);

// cluster ratings
const clusterRatings = Array(10).fill().map(() => []);

books.forEach((book, i) => {
  const rgb = parseRGB(book.dominant_color);
  const clusterIndex = assignments[i];
  const rating = parseFloat(book.average_rating);

  if (!isNaN(rating)) {
    clusterRatings[clusterIndex].push(rating);
  }
});

const clusterAvgRatings = clusterRatings.map(ratings => {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((a, b) => a + b, 0);
  return sum / ratings.length;
});

const minRating = Math.min(...clusterAvgRatings);
const maxRating = Math.max(...clusterAvgRatings);

function scaleRating(rating) {
  return 10 + ((rating - minRating) / (maxRating - minRating)) * 80;
}

$: bubbleData = centroids.map((rgb, i) => ({
  name: `Cluster ${i + 1}`,
  value: clusterCounts[i],
  x: (i + 1) * (100 / (centroids.length + 1)),
  y: clusterAvgRatings[i],
  itemStyle: {
    color: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
  }
}));

$: bubbleChartOptions = {
  toolbox: { feature: { saveAsImage: {} } },
  title: {
    text: "Average Rating per Color"
  },
  xAxis: { type: 'value', show: false, min: 0, max: 100 },
  yAxis: {
    type: 'value',
    min: 3,
    max: 5,
    axisLabel: { formatter: '{value} ★' }
  },
  tooltip: {
    formatter: function (params) {
      const i = params.dataIndex;
      const rating = clusterAvgRatings[i].toFixed(2);
      const rgb = centroids[i];
      const rgbString = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

      return `Cluster ${rgbString}<br/>Books: ${params.data[2]}<br/>Rating: ${rating}`;
    }
  },
  series: [
    {
      type: 'scatter',
      symbolSize: function (val) {
        return Math.max(Math.sqrt(val[2]) * 3, 1);
      },
      data: bubbleData.map(d => [d.x, d.y, d.value, d.name]),
      encode: {
        x: 0,
        y: 1,
        tooltip: [3, 2]
      },
      itemStyle: {
        opacity: 1.0,
        color: function (params) {
          return bubbleData[params.dataIndex].itemStyle.color;
        }
      },
      label: { show: false }
    }
  ]
};

</script>

<Navbar>
  <div slot="slider">
    <div class="slider-container">
      
      <GenreDropdown
        {allGenres}
        selectedGenres={localGenreArray}
        onToggleGenre={toggleGenre}
      />

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

<div class="flex flex-row mt-12">
  <wordcloud class="flex-1">
      <div>
        <cloud>
          <WordCloud text={wordCloudText} key={wordCloudText} />
        </cloud>
      </div>
  </wordcloud>

  <div class="scatter flex-2">
    <Chart class="-mt-13" {init} options={scatterChartOptions} />
  </div>

  <div class="flex items-center p-2 w-100 h-45" style="margin-left: -20px;">
    <Chart {init} options={graphChartOptions} />
  </div>
</div>

<div class="flex grid grid-cols-2 gap-1 items-center p-2 -mt-10">
  <div class="graph">
    <Chart {init} options={stackedAreaChartOptions} />
  </div>

  <div class="graph">
    <Chart {init} options={bumpChartOptions} />
  </div>

  <div class="graph">
    <Chart {init} options={barLineChartOptions} />
  </div>

  <div class="graph">
    <Chart {init} options={bubbleChartOptions} />
  </div>
</div>


<BookSidebar book={selectedBook} onClose={closeSidebar} />

<style>

  cloud {
    display: flex;
    justify-content: center;
  }

  @font-face { font-family:Milkyway; src: url('/fonts/Milkyway.ttf'); }
  @font-face { font-family:Coolvetica Rg; src: url('/fonts/Coolvetica Rg.otf'); }
  @font-face { font-family:Coolvetica Rg Cond; src: url('/fonts/Coolvetica Rg Cond.otf'); }

  .slider-container {
    display: flex;
    align-items: center;
    gap: 1rem; /* Abstand zwischen Dropdown und Slider */
    width: 35vw;
  }

  .scatter {
    height: 28vh;
    min-width: 60%;
  }

  .graph {
    width: 49vw;
    height: 34vh;
    background-color: #fffefc;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .slider {
    width: 25vw;
    margin: 0 auto;
    text-align: center;
  }

  wordcloud {
    text-align: center;
    max-width: 25%;
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


</style>
