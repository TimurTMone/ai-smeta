"use client";

import * as React from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

type DictionaryContextValue = {
  locale: Locale;
  dict: Dictionary;
};

const DictionaryContext = React.createContext<DictionaryContextValue | null>(
  null,
);

export function DictionaryProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  const value = React.useMemo(() => ({ locale, dict: dictionary }), [
    locale,
    dictionary,
  ]);
  return (
    <DictionaryContext.Provider value={value}>
      {children}
    </DictionaryContext.Provider>
  );
}

/** Hook for client components to access dictionary + locale. */
export function useDictionary(): DictionaryContextValue {
  const ctx = React.useContext(DictionaryContext);
  if (!ctx) {
    throw new Error("useDictionary must be used inside a DictionaryProvider");
  }
  return ctx;
}
