export function createItemSlug(item: { id: string; title?: string }): string {
  if (!item.title) return item.id;
  const cleanTitle = item.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${cleanTitle}-${item.id}`;
}

export function extractIdFromSlug(slug: string): string | null {
  if (!slug) return null;
  // If the slug is directly a 15-character PocketBase alphanumeric ID
  if (/^[a-z0-9]{15}$/i.test(slug)) {
    return slug;
  }
  // If the slug ends with a hyphen followed by a 15-character PocketBase ID
  const match = slug.match(/-([a-z0-9]{15})$/i);
  if (match) {
    return match[1];
  }
  // If no hyphen but ends with 15 alphanumeric characters
  const endMatch = slug.match(/([a-z0-9]{15})$/i);
  return endMatch ? endMatch[1] : null;
}
