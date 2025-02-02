import { createContext, type Operation } from "effection";
import { match, type MatchResult, type ParamData } from "path-to-regexp";

import { concat } from "./middleware.ts";
import type { Middleware } from "./types.ts";

const ParamsContext = createContext<MatchResult<ParamData>["params"]>(
  "revolution.params",
);

export function* useParams<T extends object>(): Operation<T> {
  return (yield* ParamsContext.expect()) as T;
}

function buildMethodRoute<T>(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  handler: Middleware<Request, T>,
): Middleware<Request, T> {
  return function* (request, next) {
    if (request.method === method) {
      return yield* handler(request, next);
    } else {
      return yield* next(request);
    }
  };
}

export function GET<T>(
  handler: Middleware<Request, T>,
): Middleware<Request, T> {
  return buildMethodRoute("GET", handler);
}

export function POST<T>(
  handler: Middleware<Request, T>,
): Middleware<Request, T> {
  return buildMethodRoute("POST", handler);
}

export function PUT<T>(
  handler: Middleware<Request, T>,
): Middleware<Request, T> {
  return buildMethodRoute("PUT", handler);
}

export function PATCH<T>(
  handler: Middleware<Request, T>,
): Middleware<Request, T> {
  return buildMethodRoute("PATCH", handler);
}

export function DELETE<T>(
  handler: Middleware<Request, T>,
): Middleware<Request, T> {
  return buildMethodRoute("DELETE", handler);
}

export function route<T>(
  path: string,
  ...middlewares: Middleware<Request, T>[]
): Middleware<Request, T> {
  const inlinedMiddleware = concat(...middlewares);
  return function* (request, next) {
    let pathname = new URL(request.url).pathname;
    let result = match(path)(pathname);
    if (result) {
      yield* ParamsContext.set(result.params);
      return yield* inlinedMiddleware(request, next);
    } else {
      return yield* next(request);
    }
  };
}
