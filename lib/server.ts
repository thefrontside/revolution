import type { Operation } from "./deps/effection.ts";
import type { Handler } from "./types.ts";

import {
  action,
  call,
  once,
  race,
  resource,
  useScope,
} from "./deps/effection.ts";

export interface ServerInfo {
  hostname: string;
  port: number;
}

export interface ServerOptions {
  port?: number;
  handler: Handler<Request, Response>;
}

export const _driver = Symbol.for("revolution.driver");

export function useServer(options: ServerOptions): Operation<ServerInfo> {
  return resource(function* (provide) {
    let scope = yield* useScope();

    let server: Deno.HttpServer;

    let handler = (request: Request) =>
      scope.run(function* () {
        let response = yield* race([
          aborted(request),
          options.handler(request),
        ]);

        //@ts-expect-error it's ok
        const driver: () => Operation<void> = response[_driver];

        if (driver) {
          scope.run(function* () {
            try {
              yield* race([aborted(request), driver()]);
            } catch (error) {
              // See https://github.com/denoland/deno/issues/10829
              if (error !== "resource closed") {
                throw error;
              }
            }
          });
        }

        return response;
      });

    let info = yield* action<ServerInfo>(
      function* (resolve) {
        server = Deno.serve({
          handler,
          port: options.port,
          onListen(info) {
            resolve(info);
          },
        });
      },
    );
    try {
      yield* provide(info);
    } finally {
      yield* call(() => server.shutdown());
    }
  });
}

// this satisfies the async/await API which must return an Repsonse
// because async functions cannot be discarded.
function* aborted(request: Request): Operation<Response> {
  if (request.signal.aborted) {
    return responseAborted();
  } else {
    yield* once(request.signal, "abort");
    return responseAborted();
  }
}

export function drive(response: Response, op: () => Operation<void>): Response {
  return Object.create(response, {
    [_driver]: {
      enumerable: false,
      value: op,
    },
  });
}

function responseAborted(): Response {
  return new Response("aborted");
}
