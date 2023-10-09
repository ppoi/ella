'use strict';

import { assign } from "lodash-es";

/**
 * 設定情報
 * @typedef {Object} AppConfig
 * @property {string} API_ENDPOINT APIエンドポイントURL
 * @property {string} AUTH_ENDPOINT CognitoユーザプールエンドポイントURL
 * @property {string} AUTH_CLIENT_ID CongnitoユーザプールクライアントID
 * @property {string} BASE_URL SPAベースURL
 */

/**
 * 設定情報
 * @type {AppConfig}
 */
const config = {};

/**
 * 設定情報を初期化します。
 * @returns {Promise<AppConfig>}
 */
function bootstarp() {
  return new Promise((resolve, reject)=>{
    fetch('/env.json').then(res=>{
      if(res.ok && res.headers.get('Content-Type') == 'application/json') {
        res.json().then(data=>{
          assign(config, data);
          Object.freeze(config);
          resolve(config);
        }).catch(e=>{
          reject({
            type: 'data',
            reason: e
          });
        });
      } else {
        reject({
          type: 'api',
          reason: `unexpected response. status=${res.status}, type=${res.headers.get('Content-Type')}`
        });
      }
    });
  });
}

export default config;
export {
  bootstarp
};