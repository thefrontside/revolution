import type { HTTPMiddleware } from "../types.ts";
import { call } from "../deps/effection.ts";

import {
  serveDir as server,
  type ServeDirOptions,
} from "https://deno.land/std@0.206.0/http/file_server.ts";

export function serveDirMiddleware(
  options?: ServeDirOptions,
): HTTPMiddleware {
  return (request) => call(server(request, options));
}
