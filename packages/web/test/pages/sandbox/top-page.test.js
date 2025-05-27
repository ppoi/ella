'use strict';

import { render, screen, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import TopPage from "~/app/pages/sandbox/top-page.svelte";
import { flushSync } from "svelte";

beforeEach(()=>{
  fetch.resetMocks();
});

describe("sandbox/top-page", () => {
  it("should call api from button click", async () => {
    render(TopPage);
    expect(document.querySelector('span.fetch-state')?.textContent).toBe('none');
  });

  it("async update", async ()=>{
    let apiResolve;
    fetch.once(()=>{
      return new Promise((resolve)=>{
        apiResolve = resolve
      });
    });
    const user = userEvent.setup();

    render(TopPage);

    const button = screen.getByText('テスト12', {selector: 'button'});
    expect(button).not.toBeNull();
    await user.click(button);

    flushSync();
    expect(document.querySelector('span.fetch-state')?.textContent).toBe('fetching');

    apiResolve(new Response(
      JSON.stringify([]), {
        headers: {
          'Content-Type': 'applicaton/json'
        }
      }
    ));

    await waitFor(()=>{
      flushSync();
      expect(document.querySelector('span.fetch-state')?.textContent).toBe('done');
    });

    const requests = fetch.requests();
    expect(requests.length).toBe(1);
    expect(requests[0].url).toBe('http://localhost/api/data/data.json');

  }, {timeout: 10000});
});