'use strict';

import { merge } from 'lodash-es';
import env from '~/app/core/env';
import {User, Session} from './types'
import session from '../session';

const TOKEN_STORE_KEY = 'ELLA_AUTH_TOKEN';
const AUTH_STATE_KEY = 'ELLA_AUTH_STATE';
const AUTH_INITIAL_URL_KEY = 'ELLA_AUTH_INITIAL_URL';

/**
 * 認可トークン
 * @typedef {Object} AuthToken
 * @property {string} access_token
 * @property {string} id_token
 * @property {string} refresh_token
 * @property {string} token_type
 * @property {number} expires_in
 */

class OidcUser extends User {

  #username = null;
  #email = null;

  constructor(username, email) {
    super();
    this.#username = username;
    this.#email = email;
  }

  get username() {
    return this.#username;
  }

  get email() {
    return this.#email
  }
}

/**
 * OIDC認証セッション情報クラス
 */
class OidcSession extends Session {

  /**
   * @type {OidcUser}
   */
  #user = null;

  /**
   * @type {AuthToken}
   */
  #token = null;

  constructor() {
    super();
  }

  get user() {
    return this.#user;
  }

  /**
   * @returns {Promise}
   */
  #completeAuthentication() {
    return new Promise((resolve, reject)=>{
      this.fetchUserInfo().then(user=>{
        this.#user = user;
        console.log('[session] complete authentication')
        if(typeof this.listener === 'function') {
          console.log('[session] execute callback');
          this.listener();
        }
        resolve();
      }).catch(reject);
    });
  }

  /**
   * 認証処理中かどうかを判定します。
   * @returns {Promise} 認証処理中の場合認証フローを続行
   */
  checkAuthenticationProceeding() {
    return new Promise((resolve, reject)=>{
      let state = sessionStorage.getItem(AUTH_STATE_KEY);
      if(state != null) {
        // 認証フロー中
        let initialURL = sessionStorage.getItem(AUTH_INITIAL_URL_KEY);
        let params = new URLSearchParams(window.location.search);
        console.log('[session] authenticated.', state, initialURL, params);
        sessionStorage.removeItem(AUTH_STATE_KEY);
        sessionStorage.removeItem(AUTH_INITIAL_URL_KEY);
        exchangeToken(params.get('code')).then(token=>{
          console.log('[session] exchanged. replace url', initialURL);
          localStorage.setItem(TOKEN_STORE_KEY, JSON.stringify(token));
          this.#token = token;
          this.#completeAuthentication().then(()=>{
            window.history.replaceState(null, null, initialURL);
            resolve(true);
          }).catch(reject);
        }).catch(e=>{
          console.log('[session] unexpected error ocurred in code exchanging', e);
          reject({
            type: 'session',
            message: e
          });
        });
      } else {
        resolve(false);
      };
    });
  }

  /**
   * ユーザ認証を実行します
   * @returns {Promise}
   */
  authenticate() {
    let state = sessionStorage.getItem(AUTH_STATE_KEY);
    let token = localStorage.getItem(TOKEN_STORE_KEY);

    // 認証画面表示(初回)
    if(state == null && token == null) {
      sessionStorage.setItem(AUTH_STATE_KEY, 'ella');
      sessionStorage.setItem(AUTH_INITIAL_URL_KEY, window.location.href);
      let params = new URLSearchParams();
      params.append('response_type', 'code');
      params.append('client_id', env.AUTH_CLIENT_ID);
      params.append('redirect_uri', env.BASE_URL);
      params.append('scope', 'openid');
      params.append('identity_provider', 'COGNITO');
      window.location.href = `${env.AUTH_ENDPOINT}/login?${params.toString()}`;
      return null;
    }

    // 認証済
    return new Promise((resolve, reject)=>{
      console.log('[session] already authenticated.');
      refreshToken(JSON.parse(token)).then(refreshedToken=>{
        this.#token = refreshedToken;
        this.#completeAuthentication().then(resolve).catch(reject);
      }).catch(e=>{
        if(e.reason != null && e.reason.status === 400) {
          console.log('[session] stored session is expired');
          sessionStorage.removeItem(AUTH_STATE_KEY);
          localStorage.removeItem(TOKEN_STORE_KEY);
          this.authenticate();
        } else {
          reject(e);
        }
      });
    });
  }

  logout() {
    return new Promise((resolve, reject)=>{
      if(this.#token == null) {
        resolve();
        return;
      }
      let params = new URLSearchParams();
      params.append('client_id', env.AUTH_CLIENT_ID);
      params.append('token', this.#token.refresh_token);
      fetch(`${env.AUTH_ENDPOINT}/oauth2/revoke`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      }).then(()=>{
        localStorage.removeItem(TOKEN_STORE_KEY);
        this.#user = null;
        console.log('[session] loggged out.')
        if(typeof this.listener === 'function') {
          console.log('[session] execute callback');
          this.listener();
        }
        resolve();
      }).catch((e)=>{
        reject(e);
        console.error(e);
      });
    });
  }

  /**
   * ユーザ情報を取得します
   * @returns {Promise<User>}
   */
  fetchUserInfo() {
    return new Promise((resolve, reject)=>{
      callUserinfoEndpoint(this.#token).then(resolve).catch(reject)
    });
  }

  /**
   * API呼び出し
   * @param {string} path APIパス
   * @param {Object<string, (Object<string, string>|string)} [options] fetchオプション
   * @returns {Promise<Response>}
   */
  callApi(path, options) {
    return new Promise((resolve, reject)=>{
      refreshToken(this.#token).then((token)=>{
        this.#token = token;
        fetch(`${env.API_ENDPOINT}${path}`, merge({
          method: 'get',
          mode: 'cors',
          headers: {
            Authorization: token.id_token
          }
        }, options)).then(resolve).catch(reject);
      }).catch(e=>{
        reject(e);
      })
    });
  }
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
 * @param {AuthToken} token 現在の認証トークン
 * @returns {Promise<AuthToken>}
 */
function refreshToken(token) {
  console.log('[session] refresh token', token);
  let refreshToken = token.refresh_token;
  return new Promise((resolve, reject)=>{
    issueToken({grant_type: 'refresh_token', refresh_token: refreshToken}).then(refreshed=>{
      refreshed.refresh_token = refreshToken;
      localStorage.setItem(TOKEN_STORE_KEY, JSON.stringify(refreshed));
      console.log('[session] token refreshed')
      resolve(refreshed);
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
  params.set('client_id', env.AUTH_CLIENT_ID);
  params.set('redirect_uri', env.BASE_URL);
  for(let key in options) {
    params.set(key, options[key]);
  }
  return new Promise((resolve, reject)=>{
    fetch(`${env.AUTH_ENDPOINT}/oauth2/token`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    }).then(res=>{
      if(res.ok) {
        res.json().then(resolve).catch(e=>{
          throw {
            message: 'fail to parse response JSON',
            cause: e
          }
        });
      } else {
        res.text().then(message=>{
          reject({
            type: 'api',
            reason: {
              status: res.status,
              message: message
            }
          });
        }).catch(e=>{
          throw {
            message: 'fail to load body contents',
            cause: e
          };
        });
      }
    }).catch(e=>{
      reject({
        'type': 'api',
        'reason': e
      });
    });
  });
}


/**
 * @param {AuthToken} token 認証トークン
 * @returns {Promise<OidcUser>}
 */
function callUserinfoEndpoint(token) {
  return new Promise((resolve, reject)=>{
    fetch(`${env.AUTH_ENDPOINT}/oauth2/userInfo`, {
      headers: {
        'Authorization': `Bearer ${token.access_token}`
      }
    }).then((res)=>{
      if(res.ok) {
        res.json().then((data)=>{
          let use = new OidcUser(data.username, data.email);
          resolve(use);
        }).catch(e=>{
          throw e;
        });
      } else {
        res.text().text((message)=>{
          reject({
            type: 'auth',
            reason: {
              status: res.status,
              message: message
            }
          });
        }).catch(e=>{
          throw e;
        });
      }
    }).catch(e=>{
      reject({
        type: 'auth',
        reason: e
      });
    });
  });
}

/**
 * OIDCセッションインスタンスを生成します
 */
export default ()=>new OidcSession;
export {
  OidcUser,
  OidcSession
}