import { CurrentDocument, CurrentSlot } from "../render.ts";
import { createScope, type Operation, type Scope } from "../deps/effection.ts";
import {
  afterEach,
  beforeEach,
  createHTMLDocument,
  describe,
  expect,
  expectType,
  it,
} from "./suite.ts";

type HTMLButton = Operation<HTMLButtonElement>;

describe("render", () => {
  let scope: Scope;
  let destroy: () => Promise<void>;
  beforeEach(() => {
    [scope, destroy] = createScope();
    scope.set(CurrentDocument, createHTMLDocument());
  });
  afterEach(() => destroy());

  it("can render a button", async () => {
    let nodes: Node[] = [];
    scope.set(CurrentSlot, {
      replace: (...n) => nodes = n,
    });

    await scope.run(function* () {
      let button = yield* <button>{"Click Me"}</button> as HTMLButton;
      expectType<Element>(button);
      expect(nodes).toEqual([button]);
      expect(button.childNodes).toBeDefined();
    });
  });
});
