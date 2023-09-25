<script>
  import { onMount } from "svelte";
  import NavigationRail from "@tblab/ella-spa-core/widget/navigation/navigation-rail.svelte";
  import NavigationBar from "@tblab/ella-spa-core/widget/navigation/navigation-bar.svelte";
  import NavigationItem from "@tblab/ella-spa-core/widget/navigation/navigation-item.svelte";
  import { getWindowClass } from "@tblab/ella-spa-core/lib/utils";
    import { flip } from "svelte/animate";
    import { fly, slide } from "svelte/transition";

  let menuItems = $state([
    {
      path: "/",
      icon: "home",
      label: "Home"
    },
    {
      path: "/cgssdb",
      icon: "support_agent",
      label: "CGSS DB"
    },
    {
      path: "/sandbox",
      icon: "code",
      label: "SandBox"
    }
  ]);
  let windowClass = $state('lg');


  function checkActiveLink(path) {
    console.log('[navigation] check current path', path);
    menuItems.forEach((item=>{
      item.active = item.path === path;
    }));
  }

  function resized() {
    windowClass = getWindowClass();
  }

  $effect(()=>{
    console.log('[navigation] windowClass', windowClass);
  });

  onMount(()=>{
    checkActiveLink(window.location.pathname);
    windowClass = getWindowClass();
  });
</script>

<svelte:window onpopstate="{()=>checkActiveLink(window.location.pathname)}" onresize={resized}></svelte:window>

{#if windowClass !== 'sm'}
  <NavigationRail>
    {#each menuItems as item, idx(item)}
      <NavigationItem path={item.path} label={item.label} icon={item.icon} active={item.active} onclick={()=>checkActiveLink(item.path)}></NavigationItem>
    {/each}
    {#snippet configuration()}
      <NavigationItem path="#/login" label="Login" icon="login"></NavigationItem>        
    {/snippet}
  </NavigationRail>  
{:else}
  <NavigationBar>
    {#each menuItems as item}
      <NavigationItem path={item.path} label={item.label} icon={item.icon} active={item.active} onclick={()=>checkActiveLink(item.path)}></NavigationItem>
    {/each}
  </NavigationBar>
{/if}

<style>
  :global {
    @media(min-width: 768px) {
      main {
        padding-left: var(--gv-navigation-width, 80px);
      }
    }
    @media(max-width: 767px) {
      main {
        padding-bottom: var(--gv-navigation-width, 80px);
      }
    }
  }
</style>