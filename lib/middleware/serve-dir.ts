import type { HTTPMiddleware } from "../types.ts";
import { call } from "effection";
import { serveDir as server, type ServeDirOptions } from "@std/http";

export function serveDirMiddleware(
  options?: ServeDirOptions,
): HTTPMiddleware {
  return (request) => call(server(request, options));
}
