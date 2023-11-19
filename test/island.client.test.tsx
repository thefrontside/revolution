import { beforeEach, describe, expect, it } from "./suite.ts";
import {
  createContext,
  createSignal,
  each,
  ensure,
  type Operation,
  spawn,
} from "../lib/deps/effection.ts";
import {
  type Browser,
  type ConsoleEvent,
  launch,
  type Page,
  type PageErrorEvent,
} from "https://deno.land/x/astral@0.3.1/mod.ts";

import { type ServerInfo } from "../mod.ts";

import { testApp } from "./test-app.tsx";

const BrowserContext = createContext<Browser>("browser");
const ServerContext = createContext<ServerInfo>("server-info");

describe("islands on the client", () => {
  beforeEach(function* (scope) {
    let browser = yield* launch();
    scope.set(BrowserContext, browser);
    yield* ensure(() => browser.close());
  });

  beforeEach(function* (scope) {
    let server = yield* testApp().start({ port: 8998 });
    scope.set(ServerContext, server);
  });

  it("works", function* () {
    let page = yield* usePage("/");

    let title = yield* page.evaluate(() => document.body.innerText);

    expect(title).toContain("Hello World. This is client.");
  });
});

function* useBrowser(): Operation<Browser> {
  return yield* BrowserContext;
}

function* usePage(path: string): Operation<Page> {
  let browser = yield* useBrowser();
  let server = yield* ServerContext;
  let url = `http://${server.hostname}:${server.port}${path}`;
  let messages = createSignal<ConsoleEvent, never>();
  let errors = createSignal<PageErrorEvent, never>();
  let page = yield* browser.newPage(url);

  page.addEventListener("console", messages.send);
  page.addEventListener("pageerror", errors.send);

  yield* spawn(function* () {
    for (let event of yield* each(messages)) {
      console.log({ event });
      yield* each.next();
    }
  });

  yield* spawn(function* () {
    for (let event of yield* each(errors)) {
      console.log({ event });
      yield* each.next();
    }
  });
  yield* ensure(() => page.close());
  return page;
}
