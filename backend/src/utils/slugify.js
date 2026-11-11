/**
 * Converts free text into a URL-safe, lowercase slug.
 *
 * @param {string} text - Source text (e.g. a category name).
 * @returns {string} Slug containing only `a-z`, `0-9`, and single hyphens.
 * @example
 * slugify('Courses & Learning'); // 'courses-learning'
 */
export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
