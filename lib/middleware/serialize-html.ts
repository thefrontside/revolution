import type { HASTHtmlNode } from "../types.ts";

import { toHtml } from "hast-util-to-html";

export function serializeHtml(node: HASTHtmlNode): Response {
  let doctype = { type: "doctype" } as const;

  return new Response(toHtml([doctype, node]), {
    headers: {
      "Content-Type": "text/html; charset=utf-8;",
    },
  });
}
