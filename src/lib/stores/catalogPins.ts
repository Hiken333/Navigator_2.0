import { writable } from "svelte/store";

const RECENT_KEY = "navigator-recent-classes";
const FAVORITE_KEY = "navigator-favorite-classes";
const RECENT_LIMIT = 40;

export type FavoriteClass = {
  classId: string;
  directory: string;
};

function readIds(key: string): string[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    return [];
  }
}

function readFavorites(): FavoriteClass[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(FAVORITE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isFavoriteClass);
  } catch {
    return [];
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function isFavoriteClass(value: unknown): value is FavoriteClass {
  if (!value || typeof value !== "object") return false;
  const pin = value as FavoriteClass;
  return (
    typeof pin.classId === "string" && pin.classId.length > 0 && typeof pin.directory === "string"
  );
}

function createRecentStore() {
  const { subscribe, update } = writable<string[]>(readIds(RECENT_KEY));
  return {
    subscribe,
    remember(classId: string) {
      update((ids) => {
        const next = [classId, ...ids.filter((id) => id !== classId)].slice(0, RECENT_LIMIT);
        writeJson(RECENT_KEY, next);
        return next;
      });
    },
  };
}

function createFavoriteStore() {
  const { subscribe, update } = writable<FavoriteClass[]>(readFavorites());
  return {
    subscribe,
    toggle(classId: string, directory: string) {
      update((pins) => {
        const exists = pins.some((pin) => pin.classId === classId);
        const next = exists
          ? pins.filter((pin) => pin.classId !== classId)
          : [...pins, { classId, directory }];
        writeJson(FAVORITE_KEY, next);
        return next;
      });
    },
  };
}

export const recentClassIds = createRecentStore();
export const favoriteClasses = createFavoriteStore();
