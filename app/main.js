'use strict';

import { bootstrap } from './core/session';
import App from './app.svelte';

bootstrap().then(session=>{
  new App({
    target: document.querySelector('#app')
  });
}).catch(e=>{
  console.error('fail to initialize app.', e);
  alert('fail to initialize app.');
});