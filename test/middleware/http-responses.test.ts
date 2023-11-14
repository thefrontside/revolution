import { describe, expect, it } from "../suite.ts";
import {
  concat,
  httpResponsesMiddleware,
  respondNotFound,
} from "../../mod.ts";

describe("http responses middleware", () => {
  it("can short circuit a middleware stack with a 404", function* () {
    let handler = concat(
      httpResponsesMiddleware(),
      function* () {
        return yield* respondNotFound();
      },
    );

    let request = new Request("http://localhost/test.html");

    let response = yield* handler(request, function* () {
      throw new Error(`should not reach here.`);
    });

    expect(response.status).toEqual(404);
  });
});
