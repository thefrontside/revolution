import * as bdd from "https://deno.land/std@0.163.0/testing/bdd.ts";
import {
  createScope,
  type Operation,
  type Scope,
  suspend,
} from "../deps/effection.ts";

export { expect } from "https://deno.land/x/expect@v0.2.9/mod.ts";
export * from "npm:ts-expect";
export const describe = bdd.describe;

let error: Error | undefined = undefined;
let scope: Scope;
let destroy = async () => {};
bdd.beforeEach(() => {
  [scope, destroy] = createScope();
});

bdd.afterEach(async () => {
  await destroy();
  if (error) {
    throw error;
  }
});

export function beforeEach(op: (scope: Scope) => Operation<void>): void {
  bdd.beforeEach(() => {
    return new Promise((resolve) => {
      scope.run(function* () {
        try {
          yield* op(scope);
          resolve();
          yield* suspend();
        } catch (e) {
          error = e;
        }
      });
    });
  });
}

export function it(desc: string, op: () => Operation<void>): void {
  bdd.it(desc, () => scope.run(op));
}

import { DOMImplementation } from "https://deno.land/x/deno_dom@v0.1.41/deno-dom-wasm.ts";
import { CTOR_KEY } from "https://deno.land/x/deno_dom@v0.1.41/src/constructor-lock.ts";

export function createHTMLDocument() {
  return new DOMImplementation(CTOR_KEY)
    .createHTMLDocument() as unknown as Document;
}
