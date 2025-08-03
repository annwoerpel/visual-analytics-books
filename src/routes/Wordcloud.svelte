<script lang="ts">
  import { onMount } from "svelte";
  import d3Cloud from "d3-cloud";
  import { descending, rollups, extent } from "d3-array";

  export let text: string;

  const dimensions = {
    width: 400,
    height: 200,
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  };

  let words = [];

  function generateWordcloud(inputText: string) {
    const tokens = inputText.trim().split(/\s+/g);

    const data = rollups(
      tokens,
      (g) => g.length,
      (w) => w.toLowerCase()
    )
      .sort(([, a], [, b]) => descending(a, b))
      .map(([key, size]) => ({ text: key, size }));

    const wordPadding = 2;
    const cloudWords = [];

    const cloud = d3Cloud()
      .size([
        dimensions.width - dimensions.margin.left - dimensions.margin.right,
        dimensions.height - dimensions.margin.top - dimensions.margin.bottom,
      ])
      .words(data)
      .padding(wordPadding)
      .rotate(0)
      .font("Helvetica")
      .fontSize((d) => Math.min(Math.sqrt(d.size) * 8, 30))
      .on("word", ({ size, x, y, rotate, text }) => {
        cloudWords.push({ size, x, y, rotate, text });
      });

    cloud.start();
    words = cloudWords;
  }

  onMount(() => generateWordcloud(text));
  $: if (text) generateWordcloud(text);

  const [, maxFrequency] = extent(words, (d) => d.size);
</script>



<svg
  width={dimensions.width}
  height={dimensions.height}
  viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
  text-anchor="middle"
  font-family="Helvetica"
>
  <g transform={`translate(0 ${dimensions.margin.top})`}>
    {#each words as word}
        <text
        font-size={word.size}
        transform={`translate(${word.x}, ${word.y}) rotate(${word.rotate})`}
        fill="#3a4d3b"
        opacity={word.size / 25}>{word.text.replace(/_/g, " ")}</text
        >
    {/each}
    </g>
</svg>