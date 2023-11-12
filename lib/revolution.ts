import type { Operation } from "./deps/effection.ts";
import type { HTMLMiddleware, HTTPMiddleware, JSXMiddleware } from "./types.ts";

import {
  assertIsHtmlMiddleware,
  httpResponsesMiddleware,
  respondNotFound,
  serializeHTMLMiddleware,
  serveAssetsMiddleware,
} from "./middleware.ts";

import { type ServerInfo, useServer } from "./server.ts";

import { createHandler } from "./handler.ts";

import { join } from "https://deno.land/std@0.203.0/path/join.ts";

export interface Revolution {
  start(options?: { port?: number }): Operation<ServerInfo>;
}

export interface RevolutionOptions {
  jsx?: JSXMiddleware[];
  html?: HTMLMiddleware[];
  http?: HTTPMiddleware[];
}

export function createRevolution(options: RevolutionOptions = {}): Revolution {
  let { jsx = [], html = [], http = [] } = options;
  //@ts-expect-error TODO how can we get this to work?
  let handler = createHandler(...[
    function* () {
      return yield* respondNotFound();
    },
    ...jsx,
    assertIsHtmlMiddleware(),
    ...html,
    serializeHTMLMiddleware(),
    ...http,
    serveAssetsMiddleware({
      fsRoot: join(Deno.cwd(), "assets"),
      urlRoot: "assets",
    }),
    httpResponsesMiddleware(),
  ]);

  return {
    *start({ port } = {}) {
      let server = yield* useServer({ handler, port });
      return server;
    },
  };
}
