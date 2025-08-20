<script>
    import { Tooltip, Button } from "flowbite-svelte";

    export let book;
    export let index;
    export let onOpenSidebar = () => {};
    
</script>

<button
  type="button"
  class="group perspective w-full h-full relative"
  on:click={() => onOpenSidebar(book)}
>
  <!-- Flip Card -->
  <div
    class="flip-card transition duration-300 transform group-hover:scale-[1.05] w-full h-full relative group-hover:shadow-lg"
    class:group-hover:rotate-y-180={index != 100}
  >

    <!-- Front -->
    <div class="flip-front absolute w-full h-full backface-hidden">
      <img
        src={book.thumbnail}
        alt={`Cover of ${book.title}`}
        class="thumbnail"
      />

    </div>
    <!-- Back -->
    <div class="flip-back absolute w-full h-full backface-hidden rotate-y-180 bg-[#a3c4a5] text-white flex items-center justify-center shadow font-bold text-2xl">
      {index + 1}
    </div>
  </div>

</button>
<Tooltip class="bg-[#fffefc] text-[#000] px-3 py-2 rounded shadow-lg ease-in-out border border-[#a3c4a5]"
          style="font-family: Arial; letter-spacing: 1px; font-size: 0.7em;"
          animation="duration-200">
      {book.title}<br />
      <span style="color: #a3c4a5;">{book.authors}</span>
</Tooltip>


<style>
  @font-face { font-family:Milkyway; src: url('/fonts/Milkyway.ttf'); }
  @font-face { font-family:Coolvetica Rg; src: url('/fonts/Coolvetica Rg.otf'); }
  @font-face { font-family:Coolvetica Rg Cond; src: url('/fonts/Coolvetica Rg Cond.otf'); }

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

  span {
    color: #808080;
  }
</style>
