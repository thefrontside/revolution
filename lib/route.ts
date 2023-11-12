import type { Middleware } from "./types.ts";

import {
  match,
  type MatchResult,
} from "https://deno.land/x/path_to_regexp@v6.2.1/index.ts";

import { createContext, type Operation } from "./deps/effection.ts";

const ParamsContext = createContext<MatchResult["params"]>(
  "revoluption.params",
);

export function* useParams<T extends object>(): Operation<T> {
  return (yield* ParamsContext) as T;
}

export function route<T>(
  path: string,
  handler: Middleware<Request, T>,
): Middleware<Request, T> {
  return function* (request, next) {
    let pathname = new URL(request.url).pathname;
    let result = match(path)(pathname);
    if (result) {
      yield* ParamsContext.set(result.params);
      return yield* handler(request, next);
    } else {
      return yield* next(request);
    }
  };
}
