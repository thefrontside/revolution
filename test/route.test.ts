import { describe, expect, it } from "./suite.ts";
import { respondNotFound, route, useParams } from "../mod.ts";

describe("route", () => {
  it("makes the params available", function* () {

    let app = route("/users/:id", function* () {
      let { id } = yield* useParams<{ id: string }>();
      return new Response(`id=${id}`);
    });
    let request = new Request("http://localhost:8080/users/cowboyd");
    let response = yield* app(request, function*() {
      return yield* respondNotFound();
    });

    expect(yield* response.text()).toEqual("id=cowboyd");
  });
});
