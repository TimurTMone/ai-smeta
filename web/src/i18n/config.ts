export const locales = ["ky", "ru", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ru";

export const localeNames: Record<Locale, string> = {
  ky: "Кыргызча",
  ru: "Русский",
  en: "English",
};

export const localeFlags: Record<Locale, string> = {
  ky: "🇰🇬",
  ru: "🇷🇺",
  en: "🇬🇧",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
