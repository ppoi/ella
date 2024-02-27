<script>
  import api from '~/app/core/api';
  import PageContent from '~/app/layout/page-content.svelte';

  function apiTest() {
    api('/data/data.json').then(res=>{
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
    }).catch(e=>{
      console.error('API FAILED!!', e);
    });
  }

</script>

<PageContent>
  <button class="btn btn-primary" on:click|preventDefault={apiTest}>テスト12</button>
</PageContent>
