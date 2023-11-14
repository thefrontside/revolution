import type { Handler, Middleware } from "../types.ts";

export function dispatch<In,Out>(middleware: Middleware<In, Out>, terminus: Handler<In, Out>): Handler<In, Out> {
  return (request) => middleware(request, terminus);
}
