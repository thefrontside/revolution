import type { HTTPMiddleware } from "../types.ts";
import { until } from "effection";
import { serveDir as server, type ServeDirOptions } from "@std/http";

export function serveDirMiddleware(
  options?: ServeDirOptions,
): HTTPMiddleware {
  return (request) => until(server(request, options));
}
