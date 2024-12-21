import { type Operation, resource } from "effection";

export function useObjectURL(
  object: File | Blob | MediaSource,
): Operation<string> {
  return resource<string>(function* (provide) {
    let url = URL.createObjectURL(object);
    try {
      yield* provide(url);
    } finally {
      URL.revokeObjectURL(url);
    }
  });
}
