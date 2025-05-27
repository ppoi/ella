<script>
  import { loading } from '@tblab/ella-spa-core/widget/loading-screen.svelte';
  import { onDestroy, onMount } from 'svelte';
  import PageContent from '~/app/layout/page-content.svelte';

  onMount(()=>{
    console.log('[top-page] mounted');
  });
  onDestroy(()=>{
    console.log('[top-page] destroyed');
  });

</script>


<PageContent>
  <h3>MyPage</h3>
</PageContent>