'use script';
import route, { router, toRegexp, match, configure } from 'rawth';
import { tick } from 'svelte';
import { writable } from 'svelte/store';

configure({
  base: window.location.origin
});

const routeMatched = writable(false);

router.on.error((error)=>{
  console.error('[router] router error', error);
});


/**
 * @param {string} path 
 * @param {Function} entered 現在のURLにマッチした際のコールバック
 * @param {Function} exited 現在のURLがマッチしなくなった際のコールバック
 * @returns {Function} 終了時コールバック
 */
function register(path, entered, exited) {
  let pathRegexp = toRegexp(path);
  let stream = route(path);
  let active = false;

  const exit = ()=>{
    console.log('[router] exit', path, active);
    if(active) {
      router.off.value(checkExit);
      active = false;
      exited();
    }
  };
  const checkExit = (value)=>{
    if(!match(value, pathRegexp)) {
      exit();
    }
  };

  stream.on.value(async params=>{
    exit();
    await tick();
    active = true;
    router.on.value(checkExit);
    routeMatched.set(true);
    entered(params);
  });
  stream.on.error((error)=>{
    console.error('[router] error!', error);
  })

  return ()=>{
    console.log('[router] router end.', path);
    exit();
    stream.end();
  }
}

/**
 * 
 * @param {string} path 遷移先パス
 * @param {boolean} [silently] ヒストリを更新しない場合true
 */
function navigate(path, silently) {
  console.log('[router] navigate', path);
  setTimeout(()=>{
    if(silently) {
      window.history.replaceState(null, null, path);
    } else {
      window.history.pushState(null, null, path);
    }
    router.push(path);
  });
}

/**
 * 
 * @param {PointerEvent} ev 
 */
async function handleClick(ev) {
  if(ev.defaultPrevented) {
    // 条件: 不活性化されてない
    return;
  }
  let node = ev.target;
  do {
    if(node.nodeName == 'A') {
      // 条件: Aタグ内からのclickイベント
      if(node.dataset['widget'] == 'pushmenu') {
        // 条件: (AdminLTE対応)data-widget="pushmenu"がない
        break;
      };
      let href = node.attributes.href;
      if(href && href.value && href.value.startsWith('#')) {
          // 条件: hrefが定義されている
          //   a. 「#...」じゃない
          //   b. クロスドメインじゃない
          break;
      }
      ev.preventDefault();
      navigate(node.attributes.href.value);
      break;
    }
    node = node.parentNode;
  } while(node);
}

export {
  navigate,
  handleClick,
  register,
  routeMatched
}