import type { Task } from "./deps/effection.ts";
import type { IslandInvocation, IslandModule } from "./island.ts";

import { run } from "./deps/effection.ts";
import { CurrentDocument } from "./render.ts";

export interface IslandMainOptions {
  document: Document;
  islands: IslandInvocation[];
  modules: Record<string, IslandModule>;
}

export function main(options: IslandMainOptions): Task<void> {
  let { document } = options;
  return run(function*() {
    yield* CurrentDocument.set(options.document);

    let stack: Boundary[] = [];

    for (let boundary of boundariesOf(document)) {
      if (boundary.end) {
        let top = stack.pop();
        if (!top) {
          throw new Error(`found closing tag with no opener: {boundary.node.data}`);
        } else if (boundary.id !== top.id) {
          throw new Error(`mismatched `)
        } else {
          console.log('run island', { top, boundary });
        }
      } else {
        stack.push(boundary);
      }
    }
  });
}

interface Boundary {
  start: boolean;
  end: boolean;
  tagname: string;
  idx: number;
  id: string;
  node: Node;
}

function matchBoundary(node: Comment): Boundary | void {
  let { data } = node;
  let match = data.match(/^(\/?)island@(\d+)$/);
  if (match) {
    let [, flag, tagname, idx ] = match;
    let end = flag === "/";
    return {
      start: !end,
      end,
      tagname,
      id: `${tagname}:${Number(idx)}`,
      idx: Number(idx),
      node,
    }
  }
}

const SHOW_COMMENT = 128;

function boundariesOf(document: Document): Iterable<Boundary> {
  return {
    *[Symbol.iterator]() {
      let iterator = document.createNodeIterator(
        document.body, SHOW_COMMENT
      );

      let comment = iterator.nextNode() as Comment | null;
      while (comment) {
        let boundary = matchBoundary(comment);
        if (boundary) {
          yield boundary;
        }
        comment = iterator.nextNode() as Comment | null;
      }
    }
  }
}
