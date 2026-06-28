import { en, type Strings } from "./en";

/**
 * Minimal i18n accessor. For Sprint 1 we ship English only, but every
 * user-facing string is read through this dictionary so additional locales
 * can be added without touching components.
 */
const dictionaries = { en };

export type Locale = keyof typeof dictionaries;

export function getStrings(locale: Locale = "en"): Strings {
  return dictionaries[locale] ?? en;
}

// Convenience export for components that only need English today.
export const t = en;
