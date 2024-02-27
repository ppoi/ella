'use strict';

import { Session } from './session/types';
import oidc from './session/oidc';

/**
 * セッション情報
 * @type {Session}
 */
const session = oidc();
export default session;
