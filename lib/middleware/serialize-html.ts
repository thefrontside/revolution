import type { HASTHtmlNode } from "../types.ts";

import { toHtml } from "npm:hast-util-to-html@9.0.0";

export function serializeHtml(node: HASTHtmlNode): Response {
  let doctype = { type: "doctype" } as const;

  return new Response(toHtml([doctype, node]), {
    headers: {
      "Content-Type": "text/html; charset=utf-8;",
    },
  });
}
