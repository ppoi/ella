'use strict';

/**
 * ユーザ情報
 * @interface
 */
class User {
  get username() {
  }
  get email() {
  }
}

/**
 * @callback stateChnageCallback
 * @param {string} state
 */

/**
 * セッション情報クラス
 * @interface
 */
class Session {

  /**
   * @type {stateChnageCallback}
   */
  listener = null;

  /**
   * ユーザ情報
   * @returns {User}
   */
  get user() {
    return null;
  }

  /**
   * 未認証セッションかどうかを判定します。
   * @returns {boolean} セッションが未認証の場合true
   */
  isAnonymous() {
    return this.user == null;
  }

  /**
   * 認証処理中かどうかを判定します。
   * @returns {Promise} 認証処理中の場合認証フローを続行
   */
  checkAuthenticationProceeding() {
    return new Promise((resolve, reject)=>{
      reject(false);
    });
  }

  /**
   * ユーザ認証を実行します
   * @returns {Promise}
   */
  authenticate() {
    return new Promise((resolve, reject)=>{
      reject(false);
    });
  }

  /**
   * セッションをログアウトします
   * @returns {Promise}
   */
  logout() {
    return new Promise((resolve, reject)=>{
      reject();
    });
  }

  /**
   * API呼び出し
   * @param {string} path APIパス
   * @param {Object<string, (Object<string, string>|string)} [options] fetchオプション
   * @returns {Promise<Response>}
   */
  callApi(path, options) {
    return fetch(`${env.API_ENDPOINT}${path}`, options);
  }
}

export {
  User,
  Session
}