import type {
  HASTElement,
  HASTHtmlNode,
  HASTScriptNode,
  Middleware,
} from "../types.ts";
import { CollectedIslands, type IslandModule } from "../island.ts";
import { buildIslandBootstrap } from "../builder.ts";

export interface IslandMiddlewareOptions {
  islandsDir: string;
  modules: Record<string, IslandModule>;
}

export function createIslandMiddleware(
  options: IslandMiddlewareOptions,
): Middleware<Request, HASTHtmlNode> {
  let { islandsDir, modules } = options;
  return function* collectIslands(request, next) {
    let collection = yield* CollectedIslands.set({
      nextId: 0,
      seen: new Set(),
      modules,
      invocations: {},
    });

    let html = yield* next(request);

    let bytes = yield* buildIslandBootstrap({
      collection,
      islandsDir,
    });

    let value = new TextDecoder().decode(bytes);

    let script = {
      type: "element",
      tagName: "script",
      properties: {
        "type": "module",
      },
      children: [{
        type: "text",
        value,
      }],
    } satisfies HASTScriptNode;

    return appendToBody(html, script);
  };
}

function appendToBody(html: HASTHtmlNode, node: HASTElement): HASTHtmlNode {
  for (let child of html.children) {
    if (child.type === "element" && child.tagName === "body") {
      child.children.push(node);
      return html;
    }
  }
  throw new Error(`malformed html, no <body> element found`);
}
