'use strict';

import { beforeEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import session from "@tblab/ella-spa-core/lib/session";
import { jsonApi } from "@tblab/ella-spa-core/lib/utils";
import { navigate } from "@tblab/ella-spa-core/lib/router";
import { waitFor } from "@testing-library/svelte";

beforeEach(()=>{
  fetch.resetMocks();
});

describe("sandbox", () => {
  it("should fetch", async () => {
    fetch.once(new Response(JSON.stringify([{ userId: 1 }]), {headers: {'Content-Type': 'applicaton/json'}}));
    const response = await jsonApi(session.callApi('/users'));
    expect(fetch.requests().length).toBe(1);
    expect(fetch.requests()[0].url).toBe('http://localhost/api/users');
    expectTypeOf(response).toBeArray();
    expect(response.length).toBe(1);
    expect(response[0].userId).toBe(1);
  });

  it("page routing", async ()=>{
    console.log('window location', window.location.href)
    navigate('/sandbox/top');
    await waitFor (()=>{
      expect(window.location.pathname).toBe('/sandbox/top');
    });
    console.log('window location', window.location.href)
  });
});