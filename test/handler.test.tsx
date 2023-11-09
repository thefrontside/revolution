import type { Operation } from "../lib/deps/effection.ts";
import { describe, expect, it } from "./suite.ts";
import { toHtml } from "npm:hast-util-to-html@9.0.0";
import { createHandler, type HASTHtmlNode, type HASTNode } from "../mod.ts";

describe("handler", () => {
  it("can handle a simple request", function* () {
    let handler = createHandler(
      function* (_request: Request): Operation<Response> {
        return new Response("Simple");
      },
    );

    let response = yield* handler(
      new Request("http://localhost:80/simple.html"),
    );
    expect(yield* response.text()).toEqual("Simple");
  });

  it("can stack responses", function* () {
    let handler = createHandler(
      function* echo(request: Request) {
        return new Response(yield* request.text());
      },
      function* augment(request: Request, next) {
        let response = yield* next(request);
        let text = yield* response.text();
        return new Response(`${text} Pimple`);
      },
    );

    let response = yield* handler(
      new Request("http://localhost:80/simple.html", {
        method: "POST",
        body: "Simple",
      }),
    );
    expect(yield* response.text()).toEqual("Simple Pimple");
  });

  it("renders a simple template", function* () {
    let handler = createHandler(
      function* (req: Request) {
        return (
          <html>
            <body>{yield* req.text()}</body>
          </html>
        );
      },
      function* (req: Request, next) {
        let result = yield* next(req);
        if (isHtmlNode(result)) {
          return result as HASTHtmlNode;
        }
        throw new Error(`expected operation to return an "html" element`);
      },
      function* (req: Request, next) {
        let node = yield* next(req);
        return new Response(toHtml(node));
      },
    );

    let response = yield* handler(
      new Request("http://localhost/echo.html", {
        method: "POST",
        body: "Hello World",
      }),
    );

    expect(yield* response.text()).toEqual(
      "<html><body>Hello World</body></html>",
    );
  });
});

function isHtmlNode(node: HASTNode): node is HASTHtmlNode {
  return node.type === "element" && node.tagName === "html";
}
