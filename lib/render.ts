import type { JSXElement } from "./types.ts";
import { createContext, type Operation } from "./deps/effection.ts";

import { h, init, propsModule, attributesModule, toVNode, type VNode, type Attrs, type VNodeChildElement } from "npm:snabbdom@3.5.1";

export const CurrentSlot = createContext<HTMLSlotElement>("slot");
export const CurrentDocument = createContext<Document>("document");
const CurrentVNode = createContext<VNode>("vnode");

const patch = init([propsModule, attributesModule]);

export function* useDocument() {
  return yield* CurrentDocument;
}

type ASTNode = JSXElement;

export function render(jsx: JSXElement): Operation<void> {
  return {
    *[Symbol.iterator]() {
      let slot = yield* CurrentSlot;
      let current = yield* CurrentVNode.get();

      if (!current) {
        current = yield* CurrentVNode.set(toVNode(slot));
      }

      let vnode = h("slot", { attrs: { name: slot.name } }, toVNodes(jsx));
      patch(toVNode(slot), vnode);
    },
  };
}

function toVNodes(ast: ASTNode): VNodeChildElement[] {
  if (ast.type === "text") {
    return [String(ast.value)];
  } else if (ast.type === "root") {
    let { children } = ast;
    return children.flatMap((child) => {
      if (child.type === "doctype") {
        return [];
      } else if (child.type === "comment") {
        return [h("!", {}, child.value)];
      } else {
        return toVNodes(child);
      }
    });
  } else {
    let attrs = {} as Attrs;
    let props = {} as Record<string, unknown>;
    for (let [key, value] of Object.entries(ast.properties ?? {})) {
      if (key.startsWith("on") || !(typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')) {
        props[key] = value;
      } else {
        attrs[key] = value;
      }
    }

    let children: VNodeChildElement[] = [];
    for (let child of ast.children) {
      if (child.type === "comment") {
        children.push(h("!", {}, child.value));
      } else {
        children.push(...toVNodes(child));
      }
    }
    return [h(ast.tagName, { attrs, props }, children)];
  }
}
