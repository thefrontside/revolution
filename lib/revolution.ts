import type { Operation } from "./deps/effection.ts";
import type { Handler, AppMiddleware, HTTPMiddleware, RevolutionPlugin } from "./types.ts";

import { assertIsHTMLNode } from "./assertions.ts";
import { serializeHtml } from "./middleware/serialize-html.ts";
import {
  concat,
  dispatch,
  respondNotFound,
  httpResponsesMiddleware,
} from "./middleware.ts";

import { type ServerInfo, useServer } from "./server.ts";

export interface Revolution {
  start(options?: { port?: number }): Operation<ServerInfo>;
}

export interface RevolutionOptions {
  app?: AppMiddleware[];
  plugins?: RevolutionPlugin[];
}

export function createRevolution(options: RevolutionOptions = {}): Revolution {
  let { app = [], plugins = []} = options;

  let handler = createApp(app, plugins);

  return {
    *start({ port } = {}) {
      let server = yield* useServer({ handler, port });
      return server;
    },
  };
}

function createApp(middlewares: AppMiddleware[], plugins: RevolutionPlugin[]): Handler<Request, Response> {

  let html = concat(...plugins.flatMap((plugin) => [plugin.html ?? []].flat()));

  let http = concat(...plugins.flatMap((plugin) => [plugin.http ?? []].flat()));

  let app = concat(...middlewares.map<HTTPMiddleware>(middleware => {
    return function*(request, next) {
      //@ts-expect-error the JSX Element is always mapped into Response
      const result = yield* middleware(request, next);
      if (result instanceof Response) {
        return result;
      } else {
        assertIsHTMLNode(result);
        let element = yield* html(request, function*() { return result });
        return serializeHtml(element)
      }
    }
  }));

  let handler = concat(httpResponsesMiddleware(), http, app);

  return dispatch(handler, respondNotFound);
}
