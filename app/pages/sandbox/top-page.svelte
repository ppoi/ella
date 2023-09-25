<script>
  import session from "@tblab/ella-spa-core/lib/session";
  import { onMount } from "svelte";
  import PageContent from '~/app/layout/page-content.svelte';
  import { func1 } from "./utility.svelte";

  let fetchState = $state('none');

  function apiTest(e) {
    e.preventDefault();
    fetchState = 'fetching';
    func1(propA);
    session.callApi('/data/data.json').then(res=>{
      if(res.ok) {
        return res.json();
      } else {
        throw {
          type: 'api',
          reason: res.status
        }
      }
    }).then(data=>{
      console.log('API VERSION', data);
      fetchState = 'done';
    }).catch(e=>{
      console.error('API FAILED!!', e);
      fetchState = 'error';
    });
  }

  let viewportHeight = $state(0);
  let viewportWidth  = $state(0);

  function getViewportSize() {
    viewportHeight = window.innerHeight;
    viewportWidth = window.innerWidth;
  }

  $effect(()=>{
    console.log('[top-page] on mount effect');
    getViewportSize();
  });

  let propA = $state(0);
  let propB = $state(0);
  let propC = $state(0);

  $effect(()=>{
    console.log('[top-page] effect(a,b)', propA.value, propB.value);
    console.log('[top-page] effect(a,b) end');
  });
  $effect(()=>{
    console.log('[top-page] effect(c)', propC.value);
    $effect.root(()=>{
      propA++;
    });
    console.log('[top-page] effect(c) end');
  });

  function updateA(e) {
    e.preventDefault();
    propA++;
  }

  function updateB(e) {
    e.preventDefault();
    propB++;
  }

  function updateC(e) {
    e.preventDefault();
    propC++;
  }

</script>

<svelte:window onresize={getViewportSize}></svelte:window>

<PageContent>
  <form>
    <div class="form-floating">
      <button class="btn btn-primary" onclick={updateA}>update A</button>
      <button class="btn btn-primary" onclick={updateB}>update B</button>
      <button class="btn btn-primary" onclick={updateC}>update C</button>
    <div class="form-floating">
      <input type="number" name="height" id="windowHeight" bind:value={viewportHeight} class="form-control">
      <label for="windowHeight">window height</label>
    </div>
    <div class="form-floating">
      <input type="number" name="width" id="windowWidth" bind:value={viewportWidth} class="form-control">
      <label for="windowWidth">window width</label>
    </div>
    <div>
      <p>fetchState: <span class="fetch-state">{fetchState}</span></p>
      <button class="btn btn-primary" onclick={apiTest}>テスト12</button>
    </div>
  </form>
  {#each {length: 100}, i}
    <p>あ[{i+1}]</p>
  {/each}
</PageContent>
