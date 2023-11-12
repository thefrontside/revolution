import { describe, expect, it } from "../suite.ts";
import {
  createHandler,
  httpResponsesMiddleware,
  respondNotFound,
} from "../../mod.ts";

describe("http responses middleware", () => {
  it("can short circuit a middleware stack with a 404", function* () {
    let handler = createHandler(
      function* () {
        return yield* respondNotFound();
      },
      function* (request, next) {
        yield* next(request);
        throw new Error(`should not reach here.`);
      },
      httpResponsesMiddleware(),
    );

    let response = yield* handler(new Request("http://localhost/test.html"));
    expect(response.status).toEqual(404);
  });
});
