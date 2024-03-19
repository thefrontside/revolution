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

export function useServer(options: ServerOptions): Operation<ServerInfo> {
  return resource(function* (provide) {
    let scope = yield* useScope();

    let server: Deno.HttpServer;

    let handler = (request: Request) =>
      scope.run(() => {
        return race([aborted(request), options.handler(request)]);
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
  yield* once(request.signal, "aborted");
  return new Response();
}
