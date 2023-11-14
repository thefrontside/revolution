import type { HASTHtmlNode } from "../types.ts";

import { toHtml } from "npm:hast-util-to-html@9.0.0";

export function serializeHtml(node: HASTHtmlNode): Response {
  return new Response(toHtml(node), {
    headers: {
      "Content-Type": "text/html; charset=utf-8;",
    },
  });
}
