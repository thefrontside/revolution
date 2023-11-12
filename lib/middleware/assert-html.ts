import type { HASTHtmlNode, JSXElement, Middleware } from "../types.ts";

export function assertIsHtmlMiddleware(): Middleware<
  Request,
HASTHtmlNode,
Request,
JSXElement
> {
  return function* (req, next) {
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
  };
}
