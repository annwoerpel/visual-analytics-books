<script>
  export let color = 'red';
  export let size = 100; // in pixels
</script>

<div class="blob" style="--blob-color: {color}; width: {size}px; height: {size}px;"></div>

<style>
  .blob {
    background-color: var(--blob-color);
    border-radius: 50%;
    /* Add more styling as desired */
  }
</style>