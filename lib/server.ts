import type { Operation } from "./deps/effection.ts";
import type { Handler } from "./types.ts";

import { action, call, resource, useScope } from "./deps/effection.ts";

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
    let { handler } = options;

    let controller = new AbortController();

    let { signal } = controller;

    let scope = yield* useScope();

    let server: Deno.HttpServer;

    let info = yield* action<ServerInfo>(
      function* (resolve) {
        server = Deno.serve({
          signal,
          handler: (request) => scope.run(() => handler(request)),
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
      controller.abort();
      //@ts-expect-error is it there?
      yield* call(server.finished);
    }
  });
}
