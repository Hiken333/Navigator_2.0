import type { ClassType, GuidesGroup } from "$lib/api/types";

export const MIN_QUERY_LENGTH = 2;
export const RESULT_LIMIT = 50;

const UNGROUPED_ID = "_none";

export type CatalogSection = {
  id: string;
  title: string;
  items: ClassType[];
};

export function classLabel(item: ClassType) {
  return stripAccel(item.name) || stripAccel(item.menuCaption ?? "") || item.id;
}

export function typeGroupTitle(type: ClassType) {
  return stripAccel(type.menuCaption ?? "") || "Без группы";
}

function stripAccel(value: string) {
  return value.replaceAll("&", "").trim();
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

export function groupByGuideGroup(items: ClassType[], groups: GuidesGroup[]): CatalogSection[] {
  const knownIds = new Set(groups.map((group) => group.id).filter(Boolean));
  const byGroup = new Map<string, ClassType[]>();
  const ungrouped: ClassType[] = [];

  for (const item of items) {
    const key = item.groupId ?? "";
    if (!key || !knownIds.has(key)) {
      ungrouped.push(item);
      continue;
    }
    const list = byGroup.get(key) ?? [];
    list.push(item);
    byGroup.set(key, list);
  }

  const sections = groups
    .filter((group) => group.id && (byGroup.get(group.id)?.length ?? 0) > 0)
    .map((group) => ({
      id: group.id,
      title: group.name,
      items: byGroup.get(group.id) ?? [],
    }));

  if (ungrouped.length > 0) {
    sections.push({ id: UNGROUPED_ID, title: "Без группы", items: ungrouped });
  }
  return sections;
}

export function groupTypes(types: ClassType[]): CatalogSection[] {
  if (types.length === 0) return [];
  const byCaption = bucketBy(types, typeGroupTitle);
  return sectionsFromBuckets(byCaption, (id) => id);
}

export function catalogSections(
  types: ClassType[],
  guides: ClassType[],
  groups: GuidesGroup[],
  query: string,
): CatalogSection[] {
  const searching = isSearchQuery(query);
  const typeItems = searching ? types.filter((item) => matchesQuery(item, query)) : types;
  const guideItems = searching ? guides.filter((item) => matchesQuery(item, query)) : guides;
  return mergeByTitle([...groupTypes(typeItems), ...groupByGuideGroup(guideItems, groups)]);
}

function mergeByTitle(sections: CatalogSection[]): CatalogSection[] {
  const byTitle = new Map<string, ClassType[]>();
  for (const section of sections) {
    const list = byTitle.get(section.title) ?? [];
    list.push(...section.items);
    byTitle.set(section.title, list);
  }
  return [...byTitle.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "ru"))
    .map(([title, items]) => ({
      id: title,
      title,
      items: uniqueById(items),
    }));
}

function uniqueById(items: ClassType[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function bucketBy(items: ClassType[], keyOf: (item: ClassType) => string) {
  const buckets = new Map<string, ClassType[]>();
  for (const item of items) {
    const key = keyOf(item);
    const list = buckets.get(key) ?? [];
    list.push(item);
    buckets.set(key, list);
  }
  return buckets;
}

function sectionsFromBuckets(
  buckets: Map<string, ClassType[]>,
  titleOf: (id: string) => string,
): CatalogSection[] {
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b, "ru"))
    .map(([id, items]) => ({ id, title: titleOf(id), items }));
}
