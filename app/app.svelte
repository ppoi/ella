<script>
  import LoadingScreen from "./widget/loading-screen.svelte";
  import HeaderMenu from "./layout/header-menu.svelte";
  import SandBoxRoute from "./pages/sandbox/route.svelte"
  import { routeMatched, handleClick, navigate } from "./core/router";
  import { onMount } from "svelte";

  onMount(()=>{
    navigate(window.location.pathname + window.location.search, true);
  });
</script>

<svelte:window on:click={handleClick}></svelte:window>

<LoadingScreen></LoadingScreen>
<HeaderMenu></HeaderMenu>
<div class="container">
  <SandBoxRoute />
  {#if !$routeMatched}
    <div>not found.</div>
  {/if}
</div>