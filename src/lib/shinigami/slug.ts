// ============================================================
// lib/shinigami/slug.ts — slug publik HyuuHub
//
// URL kita tidak pernah memakai upstream url / uuid, selalu
// slug turunan judul:  /manga/the-ultimate-shut-in
//                      /read/the-ultimate-shut-in/97
// ============================================================

/**
 * slugify judul upstream → slug stabil.
 * Normalize unicode (curly apostrophe ’ → hilang), strip tanda
 * baca, spasi → "-", lowercase, potong 80 char.
 */
export function slugify(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’`"“”‘]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** chapter → segmen slug angka: 97 / 110.3 */
export function chapterSlug(number: number | string | null | undefined): string {
  if (number == null || number === "") return "0";
  const n = typeof number === "number" ? number : Number(number);
  if (!Number.isFinite(n)) return encodeURIComponent(String(number));
  return String(n);
}

/** true kalau string terlihat seperti uuid upstream (fallback resolusi) */
export function looksLikeUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

/** URL internal kita dari slug — satu-satunya pembangun href di UI */
export function mangaHref(slug: string): string {
  return `/manga/${encodeURIComponent(slug)}`;
}

export function readHref(slug: string, chapter: string | number): string {
  return `/read/${encodeURIComponent(slug)}/${encodeURIComponent(String(chapter))}`;
}
