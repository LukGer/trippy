import { ulid } from "ulid";

const prefixes = {
  user: "usr",
  trip: "trp",
  image: "img",
} as const;

export function createID(prefix: keyof typeof prefixes): string {
  return [prefixes[prefix], ulid()].join("_");
}
