import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.42/deno-dom-wasm.ts";
import * as bdd from "https://deno.land/std@0.163.0/testing/bdd.ts";
import {
  createScope,
  expect,
  type Operation,
  type Scope,
  suspend,
} from "../lib/deps/effection.ts";
import { assert } from "../lib/deps/std.ts";
export { assert };
export { expect } from "https://deno.land/x/expect@v0.2.9/mod.ts";
export { expectType } from "npm:ts-expect";

let error: Error | void = void (0);
let scope: Scope | void = void (0);

function describeWithScope<T>(...args: bdd.DescribeArgs<T>): bdd.TestSuite<T> {
  let destroy: (() => Promise<void>) | void = void (0);

  let [name, def] = args;
  return bdd.describe(name as string, () => {
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

    if (def && typeof def === "function") {
      def();
    }
  });
}

describeWithScope.only = bdd.describe.only;
describeWithScope.ignore = bdd.describe.ignore;

export const describe: typeof bdd.describe = describeWithScope;

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

export function it(desc: string, op?: () => Operation<void>): void {
  if (op) {
    return bdd.it(desc, () => scope!.run(op));
  } else {
    return bdd.it.ignore(desc, () => {});
  }
}

it.only = function only(desc: string, op?: () => Operation<void>): void {
  if (op) {
    return bdd.it.only(desc, () => scope!.run(op));
  } else {
    return bdd.it.ignore(desc, () => {});
  }
};

it.ignore = function ignore(desc: string, op?: () => Operation<void>): void {
  return bdd.it.ignore(desc, () => {
    op;
  });
};

import { DOMImplementation } from "https://deno.land/x/deno_dom@v0.1.41/deno-dom-wasm.ts";
import { CTOR_KEY } from "https://deno.land/x/deno_dom@v0.1.41/src/constructor-lock.ts";

export function createHTMLDocument() {
  return new DOMImplementation(CTOR_KEY)
    .createHTMLDocument() as unknown as Document;
}

export function parseDOM(source: string): Document {
  let dom = new DOMParser().parseFromString(source, "text/html");
  assert(dom != null, "null dom, not good");
  return dom as unknown as Document;
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
