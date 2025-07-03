<script>
    export let book;
    export let onOpenSidebar = () => {};

    let showTooltip = false;
    let tooltipX = 0;
    let tooltipY = 0;

    function handleMouseMove(event) {
        tooltipX = event.clientX + 12; // etwas Abstand zum Cursor
        tooltipY = event.clientY + 12;
    }

    function handleMouseEnter() {
        showTooltip = true;
    }

    function handleMouseLeave() {
        showTooltip = false;
    }
</script>

<button
  type="button"
  class="book-card"
  on:click={() => onOpenSidebar(book)}
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  on:mousemove={handleMouseMove}
>
  <img src={book.thumbnail} alt="Cover of {book.title}" class="thumbnail" />

  {#if showTooltip}
    <div
      class="hover-tooltip"
      style="top: {tooltipY}px; left: {tooltipX}px;"
    >
      {book.title}<br />
      <span>{book.authors}</span><br />
    </div>
  {/if}
</button>

<style>
  .book-card {
    position: relative;
    background-color: transparent;
    cursor: pointer;
    border: none;
    padding: 0;
    width: 100%;
    aspect-ratio: 2 / 3;
  }

  .book-card:hover { box-shadow: 0 4px 12px rgba(39, 28, 16, 0.404); }

  .book-card:hover .thumbnail { transform: scale(1.05); }

  .thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }

  .hover-tooltip {
    position: fixed;
    background-color: rgba(255, 254, 252, 0.95);
    color: #000000;
    padding: 0.5rem 0.75rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-family: 'Coolvetica Rg', Arial;
    font-size: 0.85rem;
    pointer-events: none;
    z-index: 9999;
    box-shadow: 0 2px 8px rgba(38, 26, 18, 0.339);
    white-space: nowrap;
  }

  span {
    color: #808080;
  }
</style>
