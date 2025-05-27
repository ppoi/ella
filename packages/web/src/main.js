'use strict';

import { bootstrap, session, loading} from '@tblab/ella-spa-core';
import { cognito } from '@tblab/ella-spa-core/session/modules';
import { mount } from 'svelte';
import app from './app.svelte';

try {
  loading(true);
  await bootstrap({
    envDef: import.meta.env.VITE_ENV_URL,
    sessionDef: {
      module: cognito,
      tokenStore: 'local'
    }
  });
  loading(false);

  let target = document.querySelector('#app') || document.body.appendChild(document.createElement('div'));
  target.innerHTML = '';
  mount(app, {
    target: target
  });
} catch(e) {
  console.error('[main] fail to initialize app.', e);
  alert('fail to initialize app.');
}
