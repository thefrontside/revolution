import type { HTTPMiddleware } from "../types.ts";
import { call } from "../deps/effection.ts";
import { serveDir as server, type ServeDirOptions } from "../deps/std.ts";

export function serveDirMiddleware(
  options?: ServeDirOptions,
): HTTPMiddleware {
  return (request) => call(server(request, options));
}
