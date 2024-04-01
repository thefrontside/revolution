import { describe, expect, it } from "./suite.ts";
import { GET, respondNotFound, route, useParams } from "../mod.ts";
import type { Operation } from "../lib/deps/effection.ts";

describe("route", () => {
  it("makes the params available", function* () {
    let app = route("/users/:id", function* () {
      let { id } = yield* useParams<{ id: string }>();
      return new Response(`id=${id}`);
    });
    let request = new Request("http://localhost:8080/users/cowboyd");
    let response = yield* app(request, function* () {
      return yield* respondNotFound();
    });

    expect(yield* response.text()).toEqual("id=cowboyd");
  });

  describe("method-specific routes", () => {
    it("skips a handler with different method", function* () {
      let getRoute = route(
        "/users/:id",
        GET(function* () {
          throw new Error("SHOULD NEVER HIT");
          // deno-lint-ignore no-unreachable
          return new Response();
        }),
      );

      let postRoute = function* (): Operation<Response> {
        let { id } = yield* useParams<{ id: string }>();
        return new Response(`id=${id}`);
      };

      let request = new Request("http://localhost:8080/users/cowboyd", {
        method: "POST",
      });
      let response = yield* getRoute(request, postRoute);

      expect(yield* response.text()).toEqual("id=cowboyd");
    });
  });
});
