/**
 * Email sending via Resend — magic links only (for v1).
 *
 * In dev mode (NEXT_PUBLIC_API_MODE=mock, or RESEND_API_KEY missing),
 * we skip the actual send and just log the link. The /login page reads
 * the logged link from the server response and shows a dev banner with
 * a one-click "Sign in" button.
 */

import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM || "Ai-Smeta <noreply@ai-smeta.kg>";

const client = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

export async function sendMagicLinkEmail(params: {
  to: string;
  link: string;
  locale: "ky" | "ru" | "en";
}): Promise<{ devPreviewLink?: string }> {
  const { to, link, locale } = params;

  if (!client) {
    // Dev / mock mode — return the link so the /api/auth/request-link route
    // can echo it back to the client for the dev banner.
    return { devPreviewLink: link };
  }

  const subject = {
    ky: "Ai-Smetaга кирүү шилтемеси",
    ru: "Ссылка для входа в Ai-Smeta",
    en: "Your Ai-Smeta sign-in link",
  }[locale];

  const body = {
    ky: `Салам!\n\nAi-Smetaга кирүү үчүн төмөнкү шилтемеге басыңыз:\n\n${link}\n\nШилтеме 15 мүнөткө жарактуу.\n\nЭгер сиз аны талап кылбасаңыз, бул катты жокко чыгарыңыз.`,
    ru: `Здравствуйте!\n\nДля входа в Ai-Smeta нажмите на ссылку ниже:\n\n${link}\n\nСсылка действительна 15 минут.\n\nЕсли вы не запрашивали её — просто проигнорируйте это письмо.`,
    en: `Hello!\n\nClick the link below to sign in to Ai-Smeta:\n\n${link}\n\nThe link is valid for 15 minutes.\n\nIf you didn't request this, just ignore this email.`,
  }[locale];

  await client.emails.send({
    from: FROM,
    to,
    subject,
    text: body,
  });

  return {};
}
