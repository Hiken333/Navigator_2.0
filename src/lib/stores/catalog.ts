import { client } from "$lib/api/client";
import type { ClassType, GuidesGroup } from "$lib/api/types";
import { writable } from "svelte/store";

export const typesAbs = writable<ClassType[]>([]);
export const guidesAbs = writable<ClassType[]>([]);
export const guideGroups = writable<GuidesGroup[]>([]);

export async function loadCatalog(sessionId: string) {
  const [types, guides, groups] = await Promise.all([
    client.typesGet(sessionId),
    client.guidesGet(sessionId),
    client.guidesGroupsGet(sessionId),
  ]);
  typesAbs.set(types);
  guidesAbs.set(guides);
  guideGroups.set(groups);
}
