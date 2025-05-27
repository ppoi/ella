<script>
  import { onDestroy, onMount } from 'svelte';
  import { register } from '~/app/core/router';

  /**
   * @type {string} ルートパス正規表現
   */
  export let path = null;

  /**
   * ルート有効時に表示するSvelteタグ
   * @type {import('svelte').SvelteComponent}
   */
  export let component = null;

  let active = false;
  let props = null;
  let cleanup = null;

  function entered(params){
    active = true;
    props = params;
  }

  function exited() {
    active = false;
  }

  onMount(()=>{
    cleanup = register(path, entered, exited);
  });

  onDestroy(()=>{
    cleanup();
  });
</script>

{#if active}
  {#if component != null}
    <svelte:component this="{component}" params={props}></svelte:component>
  {:else}
    <slot></slot>
  {/if}
{/if}
