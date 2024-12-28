import type { Operation } from "effection";
import type * as hast from "hast";

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

export interface Handler<A, B> {
  (request: A): Operation<B>;
}

export interface Middleware<In, Out> {
  (request: In, next: Handler<In, Out>): Operation<Out>;
}

/**
 * Extends Revolution functionality
 */
export interface RevolutionPlugin {
  /**
   * HTML middleware that will be added to all html responses
   */
  html?: HTMLMiddleware | HTMLMiddleware[];

  /**
   * HTTP middleware that will be added to all requests
   */
  http?: HTTPMiddleware | HTTPMiddleware[];
}

export type JSXHandler = Middleware<Request, JSXElement>;

export type AppMiddleware = JSXHandler | HTTPMiddleware;

export type HTMLMiddleware = Middleware<Request, HASTHtmlNode>;

export type HTTPMiddleware = Middleware<Request, Response>;
