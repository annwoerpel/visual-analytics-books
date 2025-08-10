<script>
  export let allGenres = [];
  export let selectedGenres = [];
  export let onToggleGenre;

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

  import { onMount } from 'svelte';
  onMount(() => {
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  });
</script>

<div class="dropdown-container relative w-full md:w-1/2" bind:this={dropdownRef}>
  <button
    class="w-full bg-[#fffefc] border border-[#a3c4a5] rounded-lg px-4 py-2 text-left"
    on:click={toggleDropdown}
    style="font-family: 'Coolvetica Rg Cond', Arial; letter-spacing: 1px; font-size: 0.9em;"
  >
    {selectedGenres.length > 0 ? selectedGenres.join(', ') : 'Filter Genres'}
  </button>

  {#if dropdownOpen}
    <div class="dropdown-container absolute z-10 mt-2 w-full bg-white border border-[#a3c4a5] rounded-lg shadow-lg max-h-60 overflow-y-auto">
      {#each allGenres as genre}
        <label class="flex items-center px-4 py-2 hover:bg-[#f0f0f0]" style="font-family: 'Coolvetica Rg', Arial; letter-spacing: 1.5px; font-size: 0.8em;">
          <input
            type="checkbox"
            class="mr-2 accent-[#a3c4a5]"
            value={genre}
            checked={selectedGenres.includes(genre)}
            on:change={() => onToggleGenre(genre)}
          />
          {genre}
        </label>
      {/each}
    </div>
  {/if}
</div>

<style>
  .dropdown-container {
    z-index: 100;
    width: 150px;
  }
</style>