import type { Revolution } from "../mod.ts";
import { createRevolution, islandPlugin, useIsland } from "../mod.ts";

export function testApp(): Revolution {
  return createRevolution({
    *app() {
      let Hello = yield* useHello();
      return (
        <html>
          <body>
            <Hello to="World" />
          </body>
        </html>
      );
    },
    plugins: [
      islandPlugin({
        islandsDir: import.meta.resolve("./islands"),
        modules: {
          "hello.tsx": hello,
          "empty.tsx": empty,
        },
      }),
    ],
  });
}

export function useHello() {
  return useIsland<{ to?: string }>("hello.tsx");
}

import * as hello from "./islands/hello.tsx";
import * as empty from "./islands/empty.tsx";
