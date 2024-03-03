<script>
  import 'bootstrap/js/dist/collapse';
  import session from '../core/session';
  import { loading } from '../widget/loading-screen.svelte';

  function login() {
    $loading = true;
    session.authenticate().then(()=>{
      console.log('[header] session', session);
    }).finally(()=>{
      $loading = false;
    });
  }

  function logout() {
    $loading = true;
    session.logout().finally(()=>{
      $loading = false;
    })
  }

</script>
<nav class="navbar navbar-expand-lg bg-body-tertiary">
  <div class="container-fluid">
    <a class="navbar-brand" href="/"><img src="/favicon-48.png" class="rounded me-2" width="30" height="30" alt="ella">ella</a>
    <div class="collapse navbar-collapse" id="navbarNavDropdown">
      <ul class="navbar-nav">
        <li class="nav-item">
          <a class="nav-link" aria-current="page" href="my">Office</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="cgssdb">DB</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="sandbox">SandBox</a>
        </li>
      </ul>
    </div>
    <div>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
        {#if session.isAnonymous()}
        <button class="btn btn-primary" on:click={login}>Sign In</button>
      {:else}
        <button class="btn btn-primary" on:click={logout}>Sign Out</button>
      {/if}
    </div>
  </div>
</nav>