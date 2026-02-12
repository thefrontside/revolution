import type { JSXElement, Slot } from "./types.ts";
import { createContext, type Operation } from "effection";

export const CurrentSlot = createContext<Slot>("slot");
export const CurrentDocument = createContext<Document>("document");

export function* useDocument() {
  return yield* CurrentDocument.expect();
}

type ASTNode = JSXElement;

export function render(jsx: JSXElement): Operation<void> {
  return {
    *[Symbol.iterator]() {
      let doc = yield* CurrentDocument.expect();
      let nodes = toNodes(jsx, doc);
      let slot = yield* CurrentSlot.expect();
      slot.replace(...nodes);
    },
  };
}

function toNodes(ast: ASTNode, doc: Document): Node[] {
  if (ast.type === "text") {
    return [doc.createTextNode(ast.value)];
  } else if (ast.type === "root") {
    let { children } = ast;
    return children.flatMap((child) => {
      if (child.type === "doctype") {
        return [];
      } else if (child.type === "comment") {
        return [doc.createComment(child.value)];
      } else {
        return toNodes(child, doc);
      }
    });
  } else {
    let element = doc.createElement(ast.tagName);
    for (let [key, value] of Object.entries(ast.properties ?? {})) {
      //@ts-expect-error it will be fine;
      element[key] = value;
      for (let child of ast.children) {
        if (child.type === "comment") {
          element.appendChild(doc.createComment(child.value));
        } else {
          let childNodes = toNodes(child, doc);
          element.append(...childNodes);
        }
      }
    }
    return [element];
  }
}
