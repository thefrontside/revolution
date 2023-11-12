import type { HASTHtmlNode, Middleware } from "../types.ts";

import { toHtml } from "npm:hast-util-to-html@9.0.0";

export function serializeHTMLMiddleware(): Middleware<
  Request,
  Response,
  Request,
  HASTHtmlNode
> {
  return function* (request, next) {
    let node = yield* next(request);
    return new Response(toHtml(node), {
      headers: {
        "Content-Type": "text/html; charset=utf-8;",
      },
    });
  };
}
