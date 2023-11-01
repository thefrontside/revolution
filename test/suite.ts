import * as bdd from "https://deno.land/std@0.163.0/testing/bdd.ts";
import {
  createScope,
  expect,
  type Operation,
  type Scope,
  suspend,
} from "../deps/effection.ts";

export { expect } from "https://deno.land/x/expect@v0.2.9/mod.ts";
export * from "npm:ts-expect";

let error: Error | void = void (0);
let scope: Scope | void = void (0);

export function describe<T>(name: string, def: () => void): bdd.TestSuite<T> {
  let destroy: (() => Promise<void>) | void = void (0);

  return bdd.describe(name, () => {
    bdd.beforeEach(() => {
      if (!scope) {
        [scope, destroy] = createScope();
      }
    });
    bdd.afterEach(async () => {
      if (destroy) {
        scope = void (0);
        await destroy();
        if (error) {
          throw error;
        }
      }
    });
    def();
  });
}

export function beforeEach(op: (scope: Scope) => Operation<void>): void {
  bdd.beforeEach(() => {
    return new Promise((resolve) => {
      scope!.run(function* () {
        try {
          yield* op(scope!);
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
  return bdd.it(desc, () => scope!.run(op));
}

import { DOMImplementation } from "https://deno.land/x/deno_dom@v0.1.41/deno-dom-wasm.ts";
import { CTOR_KEY } from "https://deno.land/x/deno_dom@v0.1.41/src/constructor-lock.ts";

export function createHTMLDocument() {
  return new DOMImplementation(CTOR_KEY)
    .createHTMLDocument() as unknown as Document;
}

declare global {
  // deno-lint-ignore no-empty-interface
  interface Promise<T> extends Operation<T> {}
}

Object.defineProperty(Promise.prototype, Symbol.iterator, {
  get<T>(this: Promise<T>) {
    return expect(this)[Symbol.iterator];
  },
});
