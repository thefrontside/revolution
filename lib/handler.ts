import type { Handler, Middleware } from "./types.ts";

export function createHandler<In, Out>(
  $1: Middleware<In, Out, never, never>,
): Handler<In, Out>;
export function createHandler<In, Out, A, B>(
  $1: Middleware<A, B, never, never>,
  $2: Middleware<In, Out, A, B>,
): Handler<In, Out>;
export function createHandler<In, Out, A, B, C, D>(
  $1: Middleware<A, B, never, never>,
  $2: Middleware<C, D, A, B>,
  $3: Middleware<In, Out, C, D>,
): Handler<In, Out>;
export function createHandler<In, Out, A, B, C, D, E, F>(
  $1: Middleware<A, B, never, never>,
  $2: Middleware<C, D, A, B>,
  $3: Middleware<E, F, C, D>,
  $4: Middleware<In, Out, E, F>,
): Handler<In, Out>;
export function createHandler<In, Out, A, B, C, D, E, F, G, H>(
  $1: Middleware<A, B, never, never>,
  $2: Middleware<C, D, A, B>,
  $3: Middleware<E, F, C, D>,
  $4: Middleware<G, H, E, F>,
  $5: Middleware<In, Out, G, H>,
): Handler<In, Out>;
export function createHandler<In, Out>(
  ...middlewares: [
    Middleware<In, Out, never, never>,
    ...Middleware<unknown, unknown, unknown, unknown>[],
  ]
): Handler<In, unknown> {
  return middlewares.reduce((next: Handler<unknown, unknown>, middleware) => {
    //@ts-expect-error expected
    return (request) => middleware(request, next);
  }, function* () {
    throw new Error(`no next()`);
  });
}

export function createMiddleware<In, Out, NextIn = In, NextOut = Out>(
  operation: Middleware<In, Out, NextIn, NextOut>,
): Middleware<In, Out, NextIn, NextOut> {
  return operation;
}
