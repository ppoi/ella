<script context="module">
  import { writable } from "svelte/store";
  export const loading = writable(false);
</script>

{#if $loading}
<div class="loading-screen">
  <div class="loading-mark"></div>
</div>
{/if}

<style>
  :scope { display: block; }
  .loading-screen {
    display: table;
    width: 100%;
    height: 100%;
    position: absolute;
    margin: 0;
    padding: 0;
    background-color: white;
    opacity: 0.8;
    z-index: 99999;
  }
  .loading-mark {
    display: table-cell;
    text-align: center;
    vertical-align: middle;
    padding-top: 120px;
    background: url('/loading.gif') center center no-repeat;
  }
</style>