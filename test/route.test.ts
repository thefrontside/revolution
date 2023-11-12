import { describe, it, expect } from "./suite.ts";
import { useParams, route, createHandler, respondNotFound } from "../mod.ts";

describe("route", () => {
  it("makes the params available", function*() {
    let handler = createHandler(
      function*() { return yield* respondNotFound(); },
      route("/users/:id", function*() {
        let { id} = yield* useParams<{id: string}>();
        return new Response(`id=${id}`);
      }),
    );
    let response = yield* handler(new Request("http://localhost:8080/users/cowboyd"));
    expect(yield* response.text()).toEqual("id=cowboyd");
  })
})
