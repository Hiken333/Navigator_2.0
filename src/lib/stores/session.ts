import { derived, writable } from "svelte/store";

type UserInfo = {
  name: string;
  shortName: string;
  properties: string;
};

export type AppSession = {
  sessionId: string;
  userInfo: UserInfo;
};

const STORAGE_KEY = "navigator-session";

function readStorage(): AppSession | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppSession) : null;
  } catch {
    return null;
  }
}

function createSessionStore() {
  const { subscribe, set } = writable<AppSession | null>(readStorage());
  return {
    subscribe,
    set: (value: AppSession | null) => {
      set(value);
      if (value === null) {
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      }
    },
  };
}

export const session = createSessionStore();

export const isLoggedIn = derived(session, ($s) => $s !== null);
