<script>
  import api from '~/app/core/api';

  function apiTest() {
    api('/').then(res=>{
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

<button class="btn btn-primary" on:click|preventDefault={apiTest}>テスト12</button>
