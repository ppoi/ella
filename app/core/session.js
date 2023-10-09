'use strict';

import { writable, get } from "svelte/store";
import config, { bootstarp as configBootstrap } from './config';

/**
 * セッション情報
 * @typedef {Object} Session
 * @property {AuthToken} token
 */

/**
 * 認可トークン
 * @typedef {Object} AuthToken
 * @property {string} access_token
 * @property {string} id_token
 * @property {string} refresh_token
 * @property {string} token_type
 * @property {number} expires_in
 */

/**
 * セッションストア
 * @type {Writable<Session>}
 */
const activeSession = writable(null);

const TOKEN_STORE_KEY = 'ELLA_AUTH_TOKEN';
const AUTH_STATE_KEY = 'ELLA_AUTH_STATE';
const AUTH_INITIAL_URL_KEY = 'ELLA_AUTH_INITIAL_URL';

/**
 * 初期化処理
 * @returns {Promise<Session>} 初期化処理および初期セッション情報を作成するPromiseオブジェクト
 */
function bootstrap() {
  return new Promise((resolve, reject)=>{
    configBootstrap().then(()=>{
      console.log('config', config);

      let state = sessionStorage.getItem(AUTH_STATE_KEY);
      if(state !== null) {
        // 認証フロー中
        let initialURL = sessionStorage.getItem(AUTH_INITIAL_URL_KEY);
        let params = new URLSearchParams(window.location.search);
        console.log('[session] authenticated.', state, initialURL, params);
        sessionStorage.removeItem(AUTH_STATE_KEY);
        sessionStorage.removeItem(AUTH_INITIAL_URL_KEY);
        exchangeToken(params.get('code')).then(token=>{
          console.log('[session] exchanged. replace url', initialURL);
          localStorage.setItem(TOKEN_STORE_KEY, JSON.stringify(token));
          let session = {
            token: token
          };
          activeSession.set(session);
          window.history.replaceState(null, null, initialURL);
          resolve(session);
        }).catch(e=>{
          alert('FAIL TO AUTHORIZATION');
          console.log(e);
          reject();
        });
        return;
      }

      // 認証済
      let token = localStorage.getItem(TOKEN_STORE_KEY);
      if(token == null) {
        console.log('[session] not authenticated');
        authenticate();
      } else {
        console.log('[session] already authenticated.');
        let session = {
          token: JSON.parse(token)
        };
        activeSession.set(session);
        refreshToken().then(resolve).catch(e=>{
          reject(e);
        });
      }
    }).catch(e=>{
      reject(e);
    });
  });
}

/**
 * 認証画面表示
 */
function authenticate() {
  sessionStorage.setItem(AUTH_STATE_KEY, 'ella');
  sessionStorage.setItem(AUTH_INITIAL_URL_KEY, window.location.href);
  let params = new URLSearchParams();
  params.append('response_type', 'code');
  params.append('client_id', config.AUTH_CLIENT_ID);
  params.append('redirect_uri', config.BASE_URL);
  params.append('scope', 'openid');
  params.append('identity_provider', 'COGNITO');
  window.location.href = `${config.AUTH_ENDPOINT}/login?${params.toString()}`;
}

/**
 * 認証コードから認可トークンを取得
 * @param {string} code 
 * @returns {Promise<AuthToken>}
 */
function exchangeToken(code) {
  console.log('[session] exchange authentication code to authorization token', code);
  return issueToken({grant_type: 'authorization_code', code: code});
}

/**
 * トークン更新
 * @returns {Promise<Session>}
 */
function refreshToken() {
  let session = get(activeSession);
  console.log('[session] refresh token', session);
  let refreshToken = session.token.refresh_token;
  return new Promise((resolve, reject)=>{
    issueToken({grant_type: 'refresh_token', refresh_token: refreshToken}).then(token=>{
      token.refresh_token = refreshToken;
      session.token = token;
      localStorage.setItem(TOKEN_STORE_KEY, JSON.stringify(token));
      console.log('[session] session refreshed')
      resolve(session);
    }).catch(e=>{
      reject(e);
    });
  });
}

/**
 * Cognitoトークンエンドポイント呼び出し
 * @param {Object<string, (string|Object<string, string>)>} options 
 * @returns {Promise<AuthToken>} 認可トークン
 */
function issueToken(options) {
  let params = new URLSearchParams();
  params.set('client_id', config.AUTH_CLIENT_ID);
  params.set('redirect_uri', config.BASE_URL);
  for(let key in options) {
    params.set(key, options[key]);
  }
  return new Promise((resolve, reject)=>{
    fetch(`${config.AUTH_ENDPOINT}/oauth2/token`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    }).then(res=>{
      if(res.ok) {
        return res.json();
      } else {
        res.text().then(message=>{
          reject({
            type: 'api',
            reason: message
          });
        }).catch(e=>{
          reject({
            type: 'api',
            reason: res.status
          });
        });
      }
    }).then(token=>{
      resolve(token);
    }).catch(e=>{
      reject({
        'type': 'network',
        'reason': e
      });
    });
  });
}

export {
  bootstrap,
  authenticate,
  refreshToken,
  activeSession
}