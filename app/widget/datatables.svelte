<script>
  import DataTables from 'datatables.net-bs5';
  import 'datatables.net-select-bs5';
  import { onMount, onDestroy, createEventDispatcher, tick } from 'svelte';
  import { assign, split } from 'lodash-es';
    import jquery from 'jquery';

  const DEFAULT_LANGUAGE = {
    "sEmptyTable":"テーブルにデータがありません",
    "sInfo":" _TOTAL_ 件中 _START_ から _END_ まで表示",
    "sInfoEmpty":" 0 件中 0 から 0 まで表示",
    "sInfoFiltered":"",
    "sInfoPostFix":"",
    "sInfoThousands":",",
    "sLengthMenu":"_MENU_ 件表示",
    "sLoadingRecords":"読み込み中...",
    "sProcessing":"処理中...",
    "sSearch":"検索:",
    "sZeroRecords":"検索に一致するデータはありません。",
    "oPaginate": {
      "sFirst":"先頭",
      "sLast":"最終",
      "sNext":"次",
      "sPrevious":"前"
    },
    "oAria": {
      "sSortAscending":": 列を昇順に並べ替えるにはアクティブにする",
      "sSortDescending":": 列を降順に並べ替えるにはアクティブにする"
    },
    "select": {
      "rows": {
        _: "%d 件選択中",
        0: ""
      }
    }
  }

  /**
   * データソース。データの配列またはデータ取得関数
   * @type {(Object<string, any>[]|Function)}
   */
  export let data = [];
  /**
   * カラム定義
   * @type {Object<string, any>[]}
   */
  export let columns = [];
  /**
   * 自動カラム幅調整ON/OFF
   * @type {boolean}
   */
  export let autoWidth = false;
  /**
   * 修正言語リソース
   * @type {Object.<string, (string|Object<string,string>)>}
   */
  export let language = {};
  /**
   * 処理結果メッセージの表示/非表示(default:true)
   * @type {boolean}
  */
  export let info = true;
  /**
   * ソート順定義。[int:columnIndex, string:('asc'|'desc')]の配列として指定
   * @type {Array}
   */
  export let order = [];
  /**
   * 表示件数メニューリスト
   * @type {int[]}
   */
   export let lengthMenu = [10, 25, 50, 100];
  /**
   * 1ページの表示件数
   * @type {number}
   */
   export let pageLength = 50;
   /**
   * ページングスタイル
   * @type {('numbers'|'simple'|'simple_numbers'|'full'|'full_numbers'|'first_last_numbers')}
  */
  export let pagingType = 'numbers'
  /**
   * ページングON/OFF
   * @type {boolean}
   */
  export let paging = true;
  /**
   * 選択機能ON/OFF
   * @type {boolean}
   */
  export let select = undefined;
  /**
   * タブインデックス
   * @type {number}
  */
  export let tabIndex = 0;
  /**
   * 行生成コールバック
   */
  export let createdRow = undefined;
  /**
   * フッターコールバック
   * @type {Function}
   */
  export let footerCallback = undefined;
  /**
   * 検索文字列
   * @type {string}
   */
  export let searchText = '';

  let tableOpts = {
    ajax: (arg1, callback, settings)=>{
      console.log('[datatables] fetch data');
      new Promise(async (resolve, reject)=>{
        if(typeof data !== 'function') {
          resolve(data);
        } else {
          try {
            resolve(await data());
          } catch(e) {
            reject(e);
          }
        }
      }).then(data=>{
        console.log('[datatables] data_complete', data);
        callback({data:data});
        dispatcher('data_completed', data);
      }).catch(reason=>{
        console.log('[datatables] data_failed', reason);
        callback({data:[]})
        dispatcher('data_failed', reason);
      });
    },
    initComplete: ()=>{
      dispatcher('datatables_completed');
    }
  };

  const dispatcher = createEventDispatcher();

  /**
   * @type {HTMLTableElement}
   */
  let container;
  /**
   * @type {import('datatables.net-bs5').Api}
   */
  export let api = null;

  function destroyDataTables() {
    console.log('[datatables] destroy previous instance.', DataTables.tables().length);
    if(api) {
      api.destroy();
      jquery(container).off().empty();
    }
    console.log('[datatables] destroyed', DataTables.tables().length);
  }

  onDestroy(()=>{
    console.log('[datatables] destroyed');
  });
  onMount(()=>{
    console.log('[datatables] mounted');
    return ()=>{
      console.log('[datatables] cleanup');
    }
  });

  $: {
    if(container) {
      console.log('[datatables] update tables options or data.');
      let options = {
        ajax: (arg1, callback, settings)=>{
          console.log('[datatables] fetch data');
          new Promise(async (resolve, reject)=>{
            if(typeof data !== 'function') {
              resolve(data);
            } else {
              try {
                resolve(await data());
              } catch(e) {
                reject(e);
              }
            }
          }).then(data=>{
            console.log('[datatables] data_complete', data);
            callback({data:data});
            dispatcher('data_completed', data);
          }).catch(reason=>{
            console.log('[datatables] data_failed', reason);
            callback({data:[]})
            dispatcher('data_failed', reason);
          });
        },
        autoWidth: autoWidth,
        info: info,
        select: select,
        columns: columns,
        pageLength: pageLength,
        lengthMenu: lengthMenu,
        paging: paging,
        pagingType: pagingType,
        order: order,
        language: assign({}, DEFAULT_LANGUAGE, language),
        search: {
          search: searchText
        },
        tabIndex: tabIndex,
        createdRow: createdRow,
        footerCallback: footerCallback
      };
      console.log('[datatables] recreate datatables instance.');
      destroyDataTables();
      console.log('[datatables] create new instance', options);
      api = new DataTables(container, options);
      api.on('click', 'tbody td', (ev)=>{
        let row = api.row(ev.target);
        if(row.length > 0) {
          console.log('[datatables] row clicked', row.data());
          dispatcher('rowclick', row.data());
        }
      });
    }
  }
</script>

<style lang="css">
  @import url('~/node_modules/datatables.net-bs5/css/dataTables.bootstrap5.css');
  @import url('~/node_modules/datatables.net-select-bs5/css/select.bootstrap5.css');
</style>

<table bind:this="{container}" class="table table-bordered table-striped"></table>
