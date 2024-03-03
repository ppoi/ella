'use strict';

import { Session } from "./types";
import env from "../env";

class NoopSession extends Session {
  #user = null;

  /**
   * @override
   */
  get user() {
    return this.#user;
  }

  /**
   * @override
   */
  checkAuthenticationProceeding(){
    new Promise((resolve, reject)=>{
      resolve();
    });
  }

  /**
   * @override
   * @returns {Promise}
   */
  authenticate() {
    return new Promise((resolve, reject)=>{
      #user = new {id:'dummy', username:'dummy'}
      this.listener();
      resolve();
    });
  }

  /**
   * @override
   * @returns {Promise}
   */
  logout() {
    return new Promise((resolve,reject)=>{
      #user = null;
      this.listener();
      resolve();
    });
  }

  /**
   * @override
   */
  callApi(path, options) {
    return fetch(`${env.API_ENDPOINT}${path}`, options);
  }
}

export default ()=>{return new NoopSession()}