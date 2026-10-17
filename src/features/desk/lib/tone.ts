/**
 * Folder colours. Each folder has a --folder-<id> token in styles/tokens.css, and the folder's id is
 * all the data needs to carry. These helpers turn an id into CSS, so no component writes a colour.
 */

/** The folder's colour as a CSS value. */
export const folderTone = (id: string) => `var(--folder-${id})`;

/** The folder's colour mixed with transparency: `percent` is how much colour (0-100). */
export const folderTint = (id: string, percent: number) => `color-mix(in srgb, ${folderTone(id)} ${percent}%, transparent)`;

const cache = new Map<string, string>();

/**
 * Read a token's resolved value in JavaScript, for canvas drawing where CSS variables do not apply.
 * Browser only; values are cached because tokens do not change while the page is open.
 */
export function readToken(name: string, fallback = "transparent"): string {
  const hit = cache.get(name);
  if (hit) return hit;
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (value) cache.set(name, value);
  return value || fallback;
}
