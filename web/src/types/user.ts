import type { Locale } from "@/i18n/config";

export type UserRole = "user" | "admin";

export type User = {
  id: string;
  email: string;
  name: string | null;
  locale: Locale;
  role: UserRole;
  org_id: string;
  created_at: string;
};

export type Session = {
  user: User;
  expires_at: string;
};
