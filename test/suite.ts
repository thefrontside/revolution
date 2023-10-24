export { expect } from "https://deno.land/x/expect@v0.2.9/mod.ts";
export * from "npm:ts-expect";
export * from "https://deno.land/std@0.163.0/testing/bdd.ts";

import { DOMImplementation } from "https://deno.land/x/deno_dom@v0.1.41/deno-dom-wasm.ts";
import { CTOR_KEY } from "https://deno.land/x/deno_dom@v0.1.41/src/constructor-lock.ts";

export function createHTMLDocument() {
  return new DOMImplementation(CTOR_KEY)
    .createHTMLDocument() as unknown as Document;
}
