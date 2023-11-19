import type { Operation } from "../../lib/deps/effection.ts";
import { render } from "../../lib/render.ts";

export interface HelloOptions {
  to?: string;
}

export default function* HelloIsland(options: HelloOptions): Operation<void> {
  let { to = "World" } = options;
  yield* render(<p class="hello">Hello {to}. This is client.</p>);
}
export function placeholder(
  { to = "World" }: HelloOptions = { to: "World" },
): JSX.Element {
  return <p class="hello">Hello {to}</p>;
}
