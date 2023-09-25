<script module>
  import { writable } from "svelte/store";
  let sessionSN = writable(0);
</script>
<script>
  import { routeMatched, navigate, registerDOMEventListeners, unregisterDOMEventListeners } from "@tblab/ella-spa-core/lib/router";
  import { onDestroy, onMount } from "svelte";
  import session from "@tblab/ella-spa-core/lib/session";
  import Main from "./layout/main.svelte";
  import Navigation from "./layout/navigation.svelte";
  import MyPageRoutes from "./pages/mypage/routes.svelte";
  import SandBoxRoutes from "./pages/sandbox/routes.svelte";

  onMount(()=>{
    session.listener = (state)=>{
      console.log('[app] change sessionstate.', session.isAnonymous());
      $sessionSN += 1;
      navigate(location.href, true);
    };
    registerDOMEventListeners();
    navigate(window.location.href, true);
  });
  onDestroy(()=>{
    unregisterDOMEventListeners();
  });

  $inspect($sessionSN, $routeMatched).with((type, sessionSN, routeMatched)=>{
    console.trace('[app] state', sessionSN, routeMatched);
  });

  function onerror(e) {
    console.log("[app] Ooops!!", e);
    // alert("Reload Window");
    // window.location.reload();
  }
</script>

<svelte:boundary {onerror}>
  {#key $sessionSN}

  <Main>
    <div class="container-fluid" role="main">
      <MyPageRoutes></MyPageRoutes>
      <SandBoxRoutes></SandBoxRoutes>
      {#if !$routeMatched}
        <div>not found.</div>
      {/if}
    </div>
  </Main>
  
  <Navigation></Navigation>
  
  {/key}
</svelte:boundary>
