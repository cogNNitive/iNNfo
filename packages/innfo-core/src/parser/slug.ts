/**
 * Derive a URL-safe slug from a name string:
 * - strip accents/diacritics
 * - lowercase
 * - replace spaces with hyphens
 * - remove non-alphanumeric characters except hyphens
 * - collapse multiple hyphens
 * - trim leading/trailing hyphens
 */
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining diacritical marks
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // spaces → hyphens
    .replace(/[^a-z0-9-]/g, '') // remove non-alphanumeric except hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
}
