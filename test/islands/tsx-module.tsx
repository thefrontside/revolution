export default function* (count: number) {
  return initial(count);
}

export function initial(count: number) {
  return <button disabled>Clicks: {count}</button>;
}
