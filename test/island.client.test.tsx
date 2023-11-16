import { describe, it } from "./suite.ts";
import { sleep } from "../lib/deps/effection.ts";
import { launch } from "https://deno.land/x/astral/mod.ts";

describe("islands on the client", () => {
  it("works", function*() {
    let browser = yield* launch();
    try {
      yield* sleep(1000);
    } finally {
      yield* browser.close();
    }
  });
})
