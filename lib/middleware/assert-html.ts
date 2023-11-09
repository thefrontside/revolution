import type { HASTHtmlNode, HASTNode } from "../types.ts";
import { createMiddleware } from "../handler.ts";

export const assertHTML = createMiddleware<
  Request,
  HASTHtmlNode,
  Request,
  HASTNode
>(function* (req, next) {
  let node = yield* next(req);
  if (node.type !== "element") {
    throw new Error(
      `expected an <html> element, but was non-element node of type: '${node.type}'`,
    );
  } else if (node.tagName !== "html") {
    throw new Error(`expected an <html> element, but was <${node.tagName}>`);
  } else {
    return node as HASTHtmlNode;
  }
});
