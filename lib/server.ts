import type { Operation } from "effection";
import type { Handler } from "./types.ts";

import { action, call, once, race, resource, useScope } from "effection";
import { ParamsContext } from "./route.ts";

export interface ServerInfo {
  hostname: string;
  port: number;
}

export interface ServerOptions {
  port?: number;
  handler: Handler<Request, Response>;
}

interface Driver {
  operation(): Operation<void>;
  params: Record<string, string | undefined> | undefined;
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

        //@ts-expect-error it's either there or it's not.
        const driver: Driver = response[_driver];

        if (driver) {
          scope.run(function* () {
            // Restore the captured params context if it was set
            if (driver.params) {
              yield* ParamsContext.set(driver.params);
            }

            try {
              yield* race([aborted(request), driver.operation()]);
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

    let info = yield* action<ServerInfo>((resolve, _reject) => {
      server = Deno.serve({
        handler,
        port: options.port,
        onListen(info) {
          resolve(info);
        },
      });
      // Return cleanup function (required by both effection v3 and v4)
      return () => {};
    });
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

export function* drive(
  response: Response,
  operation: () => Operation<void>,
): Operation<Response> {
  // Capture the current params context so it can be restored in the driver scope
  let params = yield* ParamsContext.get();

  return Object.create(response, {
    [_driver]: {
      enumerable: false,
      value: { params, operation },
    },
  });
}

function responseAborted(): Response {
  return new Response("aborted");
}
