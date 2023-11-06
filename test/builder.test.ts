import { describe, expect, it } from "./suite.ts";
import { useBuilder } from "../mod.ts";
import { useObjectURL } from "../lib/object-url.ts";

describe("island builder", () => {
  it("can build a tsx module with the revolution transform", function* () {
    let builder = yield* useBuilder();
    let bytes = yield* builder.build("./test/islands/tsx-module.tsx");
    expect(bytes).toBeDefined();

    let blob = new Blob([bytes], {
      type: "text/javascript",
    });

    let mod = yield* import(yield* useObjectURL(blob));

    expect(mod.default).toBeInstanceOf(Function);
    expect(mod.initial).toBeInstanceOf(Function);
    expect(mod.initial(0).tagName).toEqual("button");
  });
});
