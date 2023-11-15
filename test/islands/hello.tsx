import { render } from "../../lib/render.ts";

export interface HelloOptions {
  to: string;
}

export default function* Hello({ to }: HelloOptions = { to: "World" }) {
  yield* render(<p class="hello">Hello, {to}, this is client.</p>);
}
export function placeholder(
  { to = "World" }: HelloOptions = { to: "World" },
): JSX.Element {
  return <p class="hello">Hello {to}</p>;
}
