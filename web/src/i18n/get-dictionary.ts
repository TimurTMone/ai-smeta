import type { Locale } from "./config";

const dictionaries = {
  ky: () => import("./dictionaries/ky.json").then((m) => m.default),
  ru: () => import("./dictionaries/ru.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["ru"]>>;

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  return dictionaries[locale]();
};
