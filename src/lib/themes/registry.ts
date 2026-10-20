export type ThemeId = "black" | "purple" | "white";

export type ThemePreferredMode = "light" | "dark" | "system";

export type ThemeDefinition = {
  id: ThemeId;
  label: string;
  description: string;
  preferredMode: ThemePreferredMode;
};

export const themes: Record<ThemeId, ThemeDefinition> = {
  black: {
    id: "black",
    label: "Чёрная",
    description: "Тёмный интерфейс",
    preferredMode: "dark",
  },
  purple: {
    id: "purple",
    label: "Фиолетовая",
    description: "Тёмный фон с фиолетовыми акцентами",
    preferredMode: "dark",
  },
  white: {
    id: "white",
    label: "Белая",
    description: "Светлый интерфейс",
    preferredMode: "light",
  },
};

export const themeIds = Object.keys(themes) as ThemeId[];

const LEGACY_THEME_MAP: Record<string, ThemeId> = {
  default: "black",
  forest: "purple",
};

export function isThemeId(value: string): value is ThemeId {
  return value in themes;
}

export function resolveThemeId(value: string | undefined | null): ThemeId {
  if (value && isThemeId(value)) return value;
  if (value && value in LEGACY_THEME_MAP) return LEGACY_THEME_MAP[value];
  return "black";
}
