<script>
    import { Tooltip, Button } from "flowbite-svelte";

    export let book;
    export let index;
    export let onOpenSidebar = () => {};

    let showTooltip = false;

    function handleMouseEnter() {
        showTooltip = true;
    }

    function handleMouseLeave() {
        showTooltip = false;
    }
</script>

<button
  type="button"
  class="group perspective w-full h-full relative"
  on:click={() => onOpenSidebar(book)}
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
>

  <!-- Tooltip: außerhalb der Flip-Card -->
  {#if showTooltip}
    <div
      class="hover-tooltip left-1/2 -translate-x-1/2 top-full mt-2"
    >
      {book.title}<br />
      <span>{book.authors}</span>
    </div>
  {/if}

  <!-- Flip Card -->
  <div
    class="flip-card transition duration-500 transform w-full h-full relative"
    class:group-hover:rotate-y-180={index != 100}
  >
    <!-- Front -->
    <div class="flip-front absolute w-full h-full backface-hidden">
      <img src={book.thumbnail} alt="Cover of {book.title}" class="thumbnail" />
    </div>
    <!-- Back -->
    <div class="flip-back absolute w-full h-full backface-hidden rotate-y-180 bg-[#a3c4a5] text-white flex items-center justify-center shadow font-bold text-2xl">
      {index + 1}
    </div>
  </div>

</button>

<style>
  .perspective {
    perspective: 1000px;
  }

  .flip-card {
    transform-style: preserve-3d;
  }

  .flip-front,
  .flip-back {
    backface-visibility: hidden;
    width: 100%;
    height: 100%;
    display: flex;
  }

  .flip-back {
    transform: rotateY(180deg);
  }

  .rotate-y-180 {
    transform: rotateY(180deg);
  }

  .thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  }

  .hover-tooltip {
    position: absolute;
    z-index: 10000;
    background-color: rgba(255, 254, 252, 0.95);
    color: #000000;
    padding: 0.5rem 0.75rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-family: 'Coolvetica Rg', Arial;
    font-size: 0.85rem;
    box-shadow: 0 2px 8px rgba(38, 26, 18, 0.339);
    white-space: nowrap;
  }

  span {
    color: #808080;
  }
</style>
