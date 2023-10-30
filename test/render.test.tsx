import { CurrentDocument, CurrentSlot } from "../render.ts";
import { type Operation } from "../deps/effection.ts";
import {
  beforeEach,
  createHTMLDocument,
  describe,
  expect,
  expectType,
  it,
} from "./suite.ts";

type HTMLButton = Operation<HTMLButtonElement>;

describe("render", () => {
  beforeEach(function* (scope) {
    scope.set(CurrentDocument, createHTMLDocument());
  });

  it("can render a button", function* () {
    let nodes: Node[] = [];
    yield* CurrentSlot.set({
      replace: (...n) => nodes = n,
    });

    let button = yield* <button>{"Click Me"}</button> as HTMLButton;
    expectType<Element>(button);
    expect(nodes).toEqual([button]);
    expect(button.childNodes).toBeDefined();
  });
});
