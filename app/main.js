'use strict';

import { bootstrap } from './session';
import App from './app.svelte';

bootstrap().then(session=>{
  console.log('session', session);
  new App({
    target: document.querySelector('#app'),
    props: {
      session: session
    }
  });
}).catch(e=>{
  console.error('fail to initialize app', e);
  alert('fail to initialize app.');
});