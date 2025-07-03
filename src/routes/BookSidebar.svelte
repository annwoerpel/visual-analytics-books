<script lang="ts">
    export let book;
    export let onClose = () => {};
    import { fly } from 'svelte/transition';
    import { Rating } from "flowbite-svelte";

    $: textColor = getTextColor(book?.dominant_color);
    

    function clickOutside(node: HTMLElement) {
        const handleClick = (event: MouseEvent) => {
        if (!node.contains(event.target as Node)) {
            onClose();
        }
        };
        document.addEventListener('click', handleClick, true);
        return {
        destroy() {
            document.removeEventListener('click', handleClick, true);
        }
        };
    }

    function getTextColor(rgbString: string): string {
        if (!rgbString) return 'black';

        const [r, g, b] = rgbString
            .replace(/[^\d,]/g, '')
            .split(',')
            .map(Number);

        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        return brightness < 128 ? 'white' : 'black';
    }
</script>


{#if book}
  <div
    class="sidebar"
    use:clickOutside
    transition:fly="{{ x: 400, duration: 400 }}"
    style="background: linear-gradient(to bottom, {book.dominant_color}, rgba(255,255,255,0.95));"

  >
    <button class="close-btn" on:click={onClose}>×</button>
    <div style="color: {textColor};">
        <h2>{book.title}</h2>
        <h3>{book.subtitle}</h3>
        <p>
        {#key book.isbn13}
            <Rating id={book.title} total={5} size={35} rating={book.average_rating} />
        {/key}
        </p>
        <p><strong>Authors </strong> {book.authors}</p>
        <p><strong>Year </strong> {parseInt(book.published_year)}</p>
        <p><strong>Categories </strong> {book.categories}</p>
        <p><strong>Pages </strong> {parseInt(book.num_pages)}</p>
        <p><strong>ISBN </strong> {book.isbn13}</p>
    </div>
    <p><strong>Description </strong> {book.description}</p>
  </div>
{/if}

<style>
  .sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 400px;
    height: 100vh;
    background-color: rgba(255, 255, 255, 0.976);
    padding: 2rem;
    overflow-y: auto;
    z-index: 100;
    box-shadow: -4px 0 12px rgba(48, 35, 22, 0.353);
  }

  .close-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.8rem;
    font-size: 1.5rem;
    background: none;
    border: none;
    cursor: pointer;
  }

  h2 {
    font-family: 'Coolvetica Rg Cond', Arial;
    font-size: 1.5rem;
    letter-spacing: 1.3px;
  }
  h3 {
    font-family: 'Coolvetica Rg Cond', Arial;
    font-size: 1.2rem;
    letter-spacing: 1.3px;
    margin-bottom: 1rem;
  }

  p {
    font-family: 'Coolvetica Rg', Arial;
    font-size: 0.9rem;
    letter-spacing: 1.2px;
    margin-bottom: 0.7rem;
  }
</style>
