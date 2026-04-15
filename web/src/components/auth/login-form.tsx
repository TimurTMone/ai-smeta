"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Locale } from "@/i18n/config";

type Labels = {
  email_label: string;
  email_placeholder: string;
  submit: string;
  invalid_email: string;
  unknown_error: string;
  dev_banner_title: string;
  dev_banner_body: string;
};

export function LoginForm({
  locale,
  labels,
}: {
  locale: Locale;
  labels: Labels;
}) {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [devLink, setDevLink] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDevLink(null);

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError(labels.invalid_email);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });
      if (!res.ok) {
        setError(labels.unknown_error);
        return;
      }
      const json = (await res.json()) as { devPreviewLink: string | null };
      if (json.devPreviewLink) {
        setDevLink(json.devPreviewLink);
      } else {
        // Real mode — redirect to verify-pending page
        window.location.href = `/${locale}/verify?email=${encodeURIComponent(email)}`;
      }
    } catch {
      setError(labels.unknown_error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">{labels.email_label}</Label>
        <Input
          id="email"
          type="email"
          autoFocus
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={labels.email_placeholder}
          disabled={loading}
        />
      </div>
      {error && (
        <div className="text-sm text-[var(--danger)]">{error}</div>
      )}
      <Button type="submit" className="w-full" disabled={loading || !email}>
        {loading ? "…" : labels.submit}
      </Button>

      {devLink && (
        <div className="mt-6 rounded-[var(--radius)] border border-amber-300 bg-amber-50 p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
            ⚡ {labels.dev_banner_title}
          </div>
          <div className="text-xs text-amber-900 mb-3">{labels.dev_banner_body}</div>
          <a
            href={devLink}
            className="inline-block w-full text-center px-4 py-2 rounded-[var(--radius)] bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors"
          >
            Sign in now →
          </a>
          <div className="mt-2 text-[10px] font-mono text-amber-700 break-all">
            {devLink}
          </div>
        </div>
      )}
    </form>
  );
}
