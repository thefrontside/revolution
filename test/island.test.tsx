import type { Operation } from "../lib/deps/effection.ts";
import type { Handler } from "../mod.ts";

import { assert, describe, expect, it, parseDOM } from "./suite.ts";
import { createIslandMiddleware } from "../lib/middleware.ts";
import { assertIsHTMLNode } from "../lib/assertions.ts";
import { serializeHtml } from "../lib/middleware/serialize-html.ts";

import { useIsland } from "../mod.ts";

describe("islands", () => {
  describe("server", () => {
    it("renders a placeholder", function* () {
      let doc = yield* app(function* () {
        return (
          <html>
            <body>
              <main>
                {yield* useIsland("hello.tsx")}
              </main>
            </body>
          </html>
        );
      });

      expect(doc.querySelector("main")?.innerText).toEqual("Hello World");
    });

    it("passes arguments to the placeholder", function* () {
      let doc = yield* app(function* () {
        return (
          <html>
            <body>
              <main>
                {yield* useIsland("hello.tsx", { to: "Planet" })}
              </main>
            </body>
          </html>
        );
      });

      expect(doc.querySelector("main")?.innerText).toEqual("Hello Planet");
    });

    it("does not render anything if there is no placeholder provided", function* () {
      let doc = yield* app(function* () {
        return (
          <html>
            <body>
              <main>{yield* useIsland("empty.tsx")}</main>
            </body>
          </html>
        );
      });

      expect(doc.querySelector("main")?.innerText).toEqual("");
    });

    it("fails to render an island that does not exists", function* () {
      try {
        yield* app(function* () {
          return (
            <html>
              <body>
                {yield* useIsland("no-such-island.tx")};
              </body>
            </html>
          );
        });
        assert(false, "expected missing island to fail");
      } catch (error) {
        expect((error as Error).name).toEqual("MissingIslandError");
      }
    });

    it("can render islands within islands");
  });
  describe("client", () => {
    /* it("runs the client operation", function*() {
     *   let document = yield* sendToClient(function*() {
     *     return (
     *       <html>
     *         <body>
     *           {yield* island("hello.tsx", { to: "Planet" })}
     *         </body>
     *       </html>);
     *   });
     *   expect(document.body.innerText).toEqual("Hello Planet, this is client.");
     * }); */
    /* it.ignore("is ok if there is no client operation");
     * it.ignore("can handle events");
     * it.ignore("can handle multiple islands in the same set of siblings");
     * it.ignore("can render islands within islands");
     * it.ignore("can re-render a containing island"); */
  });
});

import * as hello from "./islands/hello.tsx";
import * as empty from "./islands/empty.tsx";

const collectIslands = createIslandMiddleware({
  islandsDir: import.meta.resolve("./islands"),
  modules: {
    "hello.tsx": hello,
    "empty.tsx": empty,
  },
});

function* app(handler: Handler<Request, JSX.Element>): Operation<Document> {
  let request = new Request("http://localhost/test.html");
  let html = yield* collectIslands(request, function* () {
    let element = yield* handler(request);
    assertIsHTMLNode(element);
    return element;
  });

  let text = yield* serializeHtml(html).text();

  return parseDOM(text);
}
