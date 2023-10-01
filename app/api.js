'use strict';

import { merge } from "lodash-es";

/**
 * ella API呼び出し
 * @param {import("./session").Session} session セッション情報
 * @param {string} path APIパス
 * @param {Object<string, (Object<string, string>|string)} [options] fetchオプション
 * @returns {Promise<Response>}
 */
function callApi(session, path, options) {
  return fetch(`${session.config.API_ENDPOINT}${path}`, merge({
    method: 'get',
    mode: 'cors',
    headers: {
      Authorization: session.token.id_token
    }
  }, options));
}

export default callApi;