<script>
  import { activeSession, refreshToken } from "./session";
  import api from '~/app/api';
  import { onMount } from "svelte";
  import LoadingScreen, { loading } from "./widget/loading-screen.svelte";

  /**
   * @type Session
   */
  export let session = null;
  $: {
    console.log('current session', $activeSession);
  }

  onMount(()=>{
    if(session != null) {
      $loading = true;
      refreshToken(session).then(()=>{
        $activeSession = session;
      }).catch(e=>{
        console.log('BOOOOOOOOOOO!!', e);
      }).finally(()=>{
        $loading = false;
      });
    }
  });

  function apiTest() {
    console.log('access_token', $activeSession.token.id_token);
    api($activeSession, '/').then(res=>{
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

<LoadingScreen></LoadingScreen>
<h1>ELLA</h1>
<button class="btn btn-primary" on:click|preventDefault={apiTest}>テスト1</button>