import type { JSXElement, HASTHtmlNode } from "./types.ts"

export function assertIsHTMLNode(node: JSXElement): asserts node is HASTHtmlNode {

  if (node.type !== "element") {
    throw new Error(
      `expected an <html> element, but was non-element node of type: '${node.type}'`,
    );
  } else if (node.tagName !== "html") {
    throw new Error(`expected an <html> element, but was <${node.tagName}>`);
  }
}
