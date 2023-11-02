import type { Slot } from "./types.ts";
import * as hast from "./deps/hast.ts";
import { createContext, type Operation } from "./deps/effection.ts";

export const CurrentSlot = createContext<Slot>("slot");
export const CurrentDocument = createContext<Document>("document");

type ASTNode = hast.Element | hast.Text | hast.Root;

export function render(jsx: JSX.Element): Operation<Node[] | Text | Element> {
  return {
    *[Symbol.iterator]() {
      let doc = yield* CurrentDocument;
      let nodes = toNodes(jsx, doc);
      let slot = yield* CurrentSlot;
      slot.replace(...nodes);
      if (jsx.type === "root") {
        return nodes;
      } else {
        let [node] = nodes;
        return jsx.type === "text" ? node as Text : node as Element;
      }
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
