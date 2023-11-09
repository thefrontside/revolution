import type { Operation } from "./deps/effection.ts";
import * as hast from "./deps/hast.ts";

export type JSXChild = string | number | boolean | JSXElement;
export type HASTElement = hast.Element;
export type HASTFragment = hast.Root;
export type HASTText = hast.Text;

export type HASTNode = HASTElement | HASTText | HASTFragment;

export interface HASTHtmlNode extends HASTElement {
  type: "element";
  tagName: "html";
}

export interface HASTScriptNode extends HASTElement {
  type: "element";
  tagName: "script";
}

export type JSXElement = HASTElement | HASTFragment | HASTText;

export interface Slot {
  replace(...nodes: Node[]): void;
}

export interface Middleware<In, Out, NextIn = In, NextOut = Out> {
  (request: In, next: Handler<NextIn, NextOut>): Operation<Out>;
}

export interface Handler<A, B> {
  (request: A): Operation<B>;
}
