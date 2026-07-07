import { customAlphabet } from "nanoid";

// URL-safe alphabet, no ambiguous look-alike characters.
const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

const generate = customAlphabet(alphabet, 24);

export function generateAccessToken(): string {
  return generate();
}
