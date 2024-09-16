import { createContext, type Operation } from "./deps/effection.ts";
import type {
  AppMiddleware,
  Handler,
  HTTPMiddleware,
  RevolutionPlugin,
} from "./types.ts";

import { assertIsHTMLNode } from "./assertions.ts";
import { serializeHtml } from "./middleware/serialize-html.ts";
import {
  concat,
  dispatch,
  httpResponsesMiddleware,
  respondNotFound,
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
  let handler = createApp(options);

  return {
    *start({ port } = {}) {
      let server = yield* useServer({ handler, port });
      return server;
    },
  };
}

const RevolutionOptions = createContext<RevolutionOptions>(
  "revolution.options",
);
export function* useRevolutionOptions(): Operation<RevolutionOptions> {
  return yield* RevolutionOptions;
}

function createApp({
  app: middlewares = [],
  plugins = [],
}: RevolutionOptions): Handler<Request, Response> {
  let html = concat(...plugins.flatMap((plugin) => [plugin.html ?? []].flat()));

  let http = concat(...plugins.flatMap((plugin) => [plugin.http ?? []].flat()));

  let app = concat(...middlewares.map<HTTPMiddleware>((middleware) => {
    return function* (request, next) {
      //@ts-expect-error the JSX Element is always mapped into Response
      const result = yield* middleware(request, next);
      if (result instanceof Response) {
        return result;
      } else {
        assertIsHTMLNode(result);
        let element = yield* html(request, function* () {
          return result;
        });
        return serializeHtml(element);
      }
    };
  }));

  let options: HTTPMiddleware = function* revolutionOptions(request, next) {
    yield* RevolutionOptions.set({ app: middlewares, plugins });
    return yield* next(request);
  };

  let handler = concat(options, httpResponsesMiddleware(), http, app);

  return dispatch(handler, respondNotFound);
}
