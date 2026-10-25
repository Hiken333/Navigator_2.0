import type { ClassType } from "$lib/api/types";

export const MIN_QUERY_LENGTH = 2;
export const RESULT_LIMIT = 50;

export function classLabel(item: ClassType) {
  return item.menuCaption || item.name;
}

export function isSearchQuery(query: string) {
  return query.trim().length >= MIN_QUERY_LENGTH;
}

export function matchesQuery(item: ClassType, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  return (
    item.id.toLowerCase().includes(q) ||
    item.name.toLowerCase().includes(q) ||
    (item.menuCaption?.toLowerCase().includes(q) ?? false)
  );
}

export function filterClasses(items: ClassType[], query: string) {
  if (!isSearchQuery(query)) return [];
  return items.filter((item) => matchesQuery(item, query)).slice(0, RESULT_LIMIT);
}
