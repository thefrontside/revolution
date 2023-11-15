import type { Middleware } from "../types.ts";

/**
 * Compose many middlewares into one. The first middleware will be run first
 */
export function concat<A, B>(
  ...middlewares: Middleware<A, B>[]
): Middleware<A, B> {
  if (middlewares.length === 0) {
    return (request, next) => next(request);
  } else {
    return middlewares.reduceRight((rest, middleware) => {
      return (request, next) => middleware(request, (req) => rest(req, next));
    });
  }
}
