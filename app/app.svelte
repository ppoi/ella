<script>
  import { configure, routeMatched, navigate, registerDOMEventListeners, unregisterDOMEventListeners } from "./core/router";
  import env from './core/env';
  import { onDestroy, onMount } from "svelte";
  import LoadingScreen from "./widget/loading-screen.svelte";
  import HeaderMenu from "./layout/header-menu.svelte";
  import MyPageRoute from './pages/mypage/route.svelte';
  import CgssRoute from './pages/cgssdb/route.svelte';

  configure({
    base: env.BASE_URL
  });

  onMount(()=>{
    navigate(window.location.href, true);
    registerDOMEventListeners();
  });
  onDestroy(()=>{
    unregisterDOMEventListeners();
  })
  $: console.log('[app] matched?', $routeMatched);
</script>

<LoadingScreen></LoadingScreen>
<HeaderMenu></HeaderMenu>
<div class="container-fluid">
  <MyPageRoute></MyPageRoute>
  <CgssRoute></CgssRoute>
  {#if !$routeMatched}
    <div>not found.</div>
  {/if}
</div>