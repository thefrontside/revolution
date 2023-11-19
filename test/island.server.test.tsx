import type { Operation } from "../lib/deps/effection.ts";
import type { Handler, JSXElement } from "../mod.ts";

import { assert, describe, expect, it, parseDOM } from "./suite.ts";
import { islandPlugin } from "../lib/middleware.ts";
import { useObjectURL } from "../lib/object-url.ts";
import { createRevolution, useIsland } from "../mod.ts";

describe("islands", () => {
  describe("server", () => {
    it("renders a placeholder", function* () {
      let doc = yield* app(function* () {
        let Hello = yield* useIsland<{ to?: string }>("hello.tsx");
        return (
          <html>
            <body>
              <main>
                <Hello />
              </main>
            </body>
          </html>
        );
      });

      expect(doc.querySelector("main")?.innerText).toEqual("Hello World");
    });

    it("passes arguments to the placeholder", function* () {
      let doc = yield* app(function* () {
        let Hello = yield* useIsland<{ to: string }>("hello.tsx");
        return (
          <html>
            <body>
              <main>
                <Hello to="Planet" />
              </main>
            </body>
          </html>
        );
      });

      expect(doc.querySelector("main")?.innerText).toEqual("Hello Planet");
    });

    it("does not render anything if there is no placeholder provided", function* () {
      let doc = yield* app(function* () {
        let Empty = yield* useIsland("empty.tsx");
        return (
          <html>
            <body>
              <main>
                <Empty />
              </main>
            </body>
          </html>
        );
      });

      expect(doc.querySelector("main")?.innerText).toEqual("");
    });

    it("fails to render an island that does not exists", function* () {
      let doc = yield* app(function* () {
        let NoSuchIsland = yield* useIsland("no-such-island.tx");
        return (
          <html>
            <body>
              <NoSuchIsland />
            </body>
          </html>
        );
      });

      expect(doc.documentElement?.innerText).toContain("MissingIslandError");
    });

    it("can render islands within islands");
  });
  describe("client", () => {
    it.ignore("runs the client operation", function* () {
      let document = yield* app(function* () {
        let Hello = yield* useIsland<{ to: string }>("hello.tsx");
        return (
          <html>
            <body>
              <main>
                <Hello to="Planet" />
              </main>
            </body>
          </html>
        );
      });
      let script = document.querySelector("script[type='module']");
      assert(!!script, "island entry point was not defined");
      let url = yield* useObjectURL(new Blob([script.innerHTML]));

      let { bootstrap } = yield* import(url);

      console.log(document.createNodeIterator);

      yield* bootstrap(document);

      expect(document.body.querySelector("main")?.innerText).toEqual(
        "Hello Planet, this is client.",
      );
    });
  });
});

import * as hello from "./islands/hello.tsx";
import * as empty from "./islands/empty.tsx";

const islands = islandPlugin({
  islandsDir: import.meta.resolve("./islands"),
  modules: {
    "hello.tsx": hello,
    "empty.tsx": empty,
  },
});

function* app(handler: Handler<Request, JSXElement>): Operation<Document> {
  const revolution = createRevolution({
    app: [handler],
    plugins: [islands],
  });

  let request = new Request("http://localhost/test.html");
  let response = yield* revolution.handler(request);

  let text = yield* response.text();

  return parseDOM(text);
}
