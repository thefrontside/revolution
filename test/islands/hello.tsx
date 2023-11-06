export function placeholder(
  { to }: { to: string } = { to: "World" },
): JSX.Element {
  return <p class="hello">Hello {to}</p>;
}
