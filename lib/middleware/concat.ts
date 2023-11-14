import type { Middleware } from "../types.ts";

export function concat<In, Out>(...middlewares: Middleware<In, Out>[]): Middleware<In, Out> {
  if (middlewares.length === 0) {
    return (request, next) => next(request);
  }
  return middlewares.reduceRight((rest, middleware) => {
    return function*(request, next) {
      return yield* middleware(request, function*(req) {
        return yield* rest(req, next);
      });
    }
  });
}
