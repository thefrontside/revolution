import type { HASTHtmlNode } from "../types.ts";
import { createMiddleware } from "../handler.ts";
import { toHtml } from "npm:hast-util-to-html@9.0.0";

export const serializeHtml = createMiddleware<
  Request,
  Response,
  Request,
  HASTHtmlNode
>(function* (request, next) {
  let node = yield* next(request);
  return new Response(toHtml(node), {
    headers: {
      "Content-Type": "text/html; charset=utf-8;",
    },
  });
});
