import { assert, beforeEach, describe, expect, it } from "./suite.ts";
import { island, IslandPath } from "../mod.ts";
import { dirname } from "https://deno.land/std@0.205.0/path/dirname.ts";
import { join } from "https://deno.land/std@0.205.0/path/join.ts";

describe("islands", () => {
  beforeEach(function* (scope) {
    let path = join(dirname(new URL(import.meta.url).pathname), "islands");
    scope.set(IslandPath, path);
  });
  describe("server", () => {
    it("renders a placeholder", function* () {
      let html = (
        <body>
          {yield* island("hello.tsx")}
        </body>
      );
      assert(html.type === "element");

      expect(innerText(html)).toEqual("Hello World");
    });

    it("passes arguments to the placeholder", function* () {
      let html = (
        <section>
          {yield* island("hello.tsx", { to: "Planet" })}
        </section>
      );
      assert(html.type === "element");

      let element = select("section .hello", html);

      assert(element && element.type === "element");

      expect(innerText(element)).toEqual("Hello Planet");
    });

    it("does not render anything if there is no placeholder provided");
    it("can render islands within islands");
  });
  describe.ignore("client", () => {
    it("runs the client operation");
    it("passes the initial arguments to the client operation");
    it("is ok if there is no client operation");
    it("can handle events");
    it("can render islands within islands");
    it("can re-render a containing island");
  });
});

import { toText } from "npm:hast-util-to-text@4.0.0";
import { select as $select } from "npm:hast-util-select@6.0.1";

function select(selector: string, element: JSX.Element): JSX.Element | null {
  //@ts-expect-error it is ok
  return $select(selector, element);
}

function innerText(element: JSX.Element): string {
  //@ts-expect-error it's fine
  return toText(element);
}
