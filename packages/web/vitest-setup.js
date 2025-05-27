'use strict';

import createFetchMock from "vitest-fetch-mock";
import bootstrap from "@tblab/ella-spa-core/lib/bootstrap";
import * as noop from "@tblab/ella-spa-core/lib/session/noop";
import { vi } from "vitest";

const fetchMock = createFetchMock(vi);
fetchMock.enableMocks();

await bootstrap({
  envDef: {
    API_ENDPOINT: 'http://localhost/api'
  },
  session: {
    module: noop
  }
});
