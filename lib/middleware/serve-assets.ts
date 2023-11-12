import type { HTTPMiddleware } from "../types.ts";
import { call } from "../deps/effection.ts";
import { route } from "../route.ts";

import {
  serveDir as server,
  type ServeDirOptions,
} from "https://deno.land/std@0.206.0/http/file_server.ts";

export function serveAssetsMiddleware(
  options?: ServeDirOptions,
): HTTPMiddleware {
  return route("/assets(.*)", (request) => call(server(request, options)));
}
