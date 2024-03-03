'use strict';

import { bootstrap } from './core/env';
import session from './core/session';
import App from './app.svelte';

bootstrap(new URL('env.json', document.baseURI)).then(async ()=>{
  await session.checkAuthenticationProceeding();

  let container = document.querySelector('#app');
  if(container == null) {
    container = document.body.appendChild(document.createElement('div'));
  }
  container.textContent = '';
  new App({
    target: container,
  });  
}).catch(e=>{
  console.error('fail to initialize app.', e);
  alert('fail to initialize app.');
});