import { NextResponse } from "next/server";
import { z } from "zod";
import { signMagicLink } from "@/lib/auth/jwt";
import { sendMagicLinkEmail } from "@/lib/auth/email";
import { isLocale, defaultLocale } from "@/i18n/config";

const BodySchema = z.object({
  email: z.string().email(),
  locale: z.string().optional(),
});

export async function POST(request: Request) {
  let parsed: { email: string; locale?: string };
  try {
    parsed = BodySchema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: { code: "validation", message: "Invalid email" } },
      { status: 400 },
    );
  }

  const { email } = parsed;
  const locale = parsed.locale && isLocale(parsed.locale) ? parsed.locale : defaultLocale;

  const token = await signMagicLink(email);
  const origin = request.headers.get("origin") ?? "";
  const link = `${origin}/${locale}/verify?token=${encodeURIComponent(token)}`;

  const result = await sendMagicLinkEmail({ to: email, link, locale });

  // In dev mode, echo the link back so the UI can show a dev banner.
  return NextResponse.json({
    ok: true,
    devPreviewLink: result.devPreviewLink ?? null,
  });
}
