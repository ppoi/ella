'use strict';

import { merge } from "lodash-es";
import { get } from 'svelte/store';
import { activeSession } from "./session";
import config from './config';

/**
 * ella API呼び出し
 * @param {string} path APIパス
 * @param {Object<string, (Object<string, string>|string)} [options] fetchオプション
 * @returns {Promise<Response>}
 */
function callApi(path, options) {
  /** @type {import("./session").Session} */
  let session = get(activeSession);
  console.log('[api]', session);
  return fetch(`${config.API_ENDPOINT}${path}`, merge({
    method: 'get',
    mode: 'cors',
    headers: {
      Authorization: session.token.id_token
    }
  }, options));
}

export default callApi;