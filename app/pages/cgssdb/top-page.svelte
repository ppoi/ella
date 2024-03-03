<script>
  import Datatables from "~/app/widget/datatables.svelte";
  import { fetchIdols, fetchIdolDetail } from "./cgssdb";
  import { onMount } from "svelte";
  import PageContent from "~/app/layout/page-content.svelte";
  import DataTable from "datatables.net-bs5";
  import session from "~/app/core/session";
  import { merge } from "lodash-es";
  import { loading } from "~/app/widget/loading-screen.svelte";

  let params;
  let masterData = {
    version: 0,
  };
  let idols = [];

  function backupMasterData() {
    $loading = true;
    session.callApi('/data/masterdata.json', {
      method: 'put',
      body: JSON.stringify(masterData)
    }).then(res=>{
      if(res.ok) {
        alert('OK');
      } else {
        res.text().then(text=>{
          console.error('[cgssdb] fail to save master data.', res.status, text);
        }).catch(e=>{
          console.error('[cgssdb] fail to save master data.', res.status, 'missing messsage');
        }).finally(()=>{
          alert(`ERROR!(${res.status})`);
        });
      }
    }).catch(e=>{
      console.error('[cgssdb] fail to call api', e);
      alert('ERROR!(api)');
    }).finally(()=>{
      $loading = false;
    });
  }

  $: console.log('[toppage] react?', idols);

  onMount(()=>{
    let localMaster = window.localStorage.getItem('master');
    if(localMaster) {
      masterData = JSON.parse(localMaster);
      idols = masterData.idols;
    }
    console.log('[toppage] mounted', masterData);
  });

  function listCharacters() {
    $loading = true;
    fetchIdols().then(items=>{
      console.log(items);
      idols = merge(idols, items);
      masterData.idols = idols;
      masterData.version += 1;
      console.log('[cgssdb] update idols.', masterData);
      window.localStorage.setItem('master', JSON.stringify(masterData));
    }).finally(()=>{
      $loading = false;
    });
  }

  function updateDetail(idol) {
    fetchIdolDetail(idol).then(data=>{
      idols = idols;
      masterData.idols = idols;
      console.log('[cgssdb] update idols.', masterData);
      window.localStorage.setItem('master', JSON.stringify(masterData));
    });
  }

  const listOpts = {
    columns: [
      {title: '', render: DataTable.render.select(), width: '3em'},
      {title: 'No', data: 'id', width: '4em', searchable: false},
      {title: '名前', data: 'name'},
    ],
    pageLength: 10,
    select: {
      style: 'multi',
      selector: 'td:first-child',
      headerCheckbox: false
    },
    pagingType: 'simple_numbers',
    order: [[1, 'asc']]
  }
</script>

<PageContent>
  <h2>CGSS DB</h2>

  <div class="card">
    <div class="card-body">
      {#if !session.isAnonymous()}
      <form on:submit|preventDefault>
        <button class="btn btn-primary" on:click={listCharacters}>アイドル一覧更新</button>
      </form>
      {/if}
      <p>version: {masterData.version}</p>
      <Datatables {...listOpts} bind:data="{idols}"></Datatables>
    </div>
  </div>

  {#if !session.isAnonymous()}
  <form on:submit|preventDefault class="mt-3">
    <button class="btn btn-primary" on:click={backupMasterData}>サーバ保存</button>
  </form>
  {/if}
</PageContent>
