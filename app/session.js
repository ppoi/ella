'use strict';

import { writable } from "svelte/store";
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

/**
 * 初期化処理
 * @returns {Promise<Session>} 初期化処理および初期セッション情報を作成するPromiseオブジェクト
 */
function bootstrap() {
  return new Promise((resolve, reject)=>{
    configBootstrap().then(()=>{
      console.log('config', config);

      let state = sessionStorage.getItem('AUTH_STATE');
      if(state !== null) {
        // 認証フロー中
        let initialURL = sessionStorage.getItem('AUTH_INITIAL_URL');
        let params = new URLSearchParams(window.location.search);
        console.log('params', params.toString());
        alert('AUTHEDNTICATED! ' + params.get('code'));
        sessionStorage.removeItem('AUTH_STATE');
        sessionStorage.removeItem('AUTH_INITIAL_URL');
        exchangeToken(config, params.get('code')).then(token=>{
          console.log('exchanged', initialURL);
          localStorage.setItem('AUTH_TOKEN', JSON.stringify(token));
          window.history.replaceState(null, null, initialURL);
          let session = {
            token: token
          };
          activeSession.set(session);
          resolve(session);
        }).catch(e=>{
          alert('FAIL TO AUTHORIZATION');
          console.log(e);
          reject();
        });
        return;
      }

      // 認証済
      let token = localStorage.getItem('AUTH_TOKEN');
      console.log('sotred token', token);
      if(token == null) {
        alert('NOT AUTHENTICATED. REDIRECT ' + config.AUTH_ENDPOINT);
        authenticate(config);
      } else {
        console.log('FINISH', token);
        let session = {
          token: JSON.parse(token)
        };
        activeSession.set(session);
        resolve(session);
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
  sessionStorage.setItem('AUTH_STATE', 'ella');
  sessionStorage.setItem('AUTH_INITIAL_URL', window.location.href);
  let params = new URLSearchParams();
  params.append('response_type', 'code');
  params.append('client_id', config.AUTH_CLIENT_ID);
  params.append('redirect_uri', 'http://localhost:3000');
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
  return issueToken({grant_type: 'authorization_code', code: code});
}

/**
 * トークン更新
 * @param {Session} session - セッション情報
 * @param {Promise<void>} 
 */
function refreshToken(session) {
  let refreshToken = session.token.refresh_token;
  return new Promise((resolve, reject)=>{
    issueToken({grant_type: 'refresh_token', refresh_token: refreshToken}).then(token=>{
      token.refresh_token = refreshToken;
      session.token = token;
      resolve();
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
  params.set('redirect_uri', 'http://localhost:3000');
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