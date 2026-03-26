import { EMAIL_TEXT } from "@/lib/constants";

interface PasswordResetEmailProps {
  username: string;
  resetUrl: string;
}

const colors = {
  bg: "#0a0a0a",
  card: "#141414",
  border: "#262626",
  text: "#a3a3a3",
  textStrong: "#e5e5e5",
  textMuted: "#737373",
  button: "#525252",
  buttonText: "#e5e5e5",
  expiryBg: "#1a1a1a",
  expiryBorder: "#262626",
} as const;

export function PasswordResetEmail({
  username,
  resetUrl,
}: PasswordResetEmailProps): string {
  const year = new Date().getFullYear();
  const { passwordReset: t, common } = EMAIL_TEXT;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${t.subject}</title>
  </head>
  <body style="margin:0;padding:48px 16px;background-color:${colors.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',sans-serif;">

    <!-- Brand -->
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:22px;font-weight:700;color:${colors.textStrong};letter-spacing:-0.5px;">${common.brand}</span>
    </div>

    <!-- Card -->
    <div style="background-color:${colors.card};border:1px solid ${colors.border};border-radius:12px;padding:40px 32px;max-width:440px;margin:0 auto;">

      <!-- Heading -->
      <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:${colors.textStrong};text-align:center;line-height:1.4;">
        ${t.heading}
      </h1>

      <!-- Body -->
      <p style="margin:0 0 28px;font-size:14px;color:${colors.text};text-align:center;line-height:1.7;">
        ${t.greeting(username)} ${t.body}
      </p>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:28px;">
        <a href="${resetUrl}" style="display:inline-block;background-color:${colors.button};color:${colors.buttonText};text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">
          ${t.cta}
        </a>
      </div>

      <!-- Expiry -->
      <div style="background-color:${colors.expiryBg};border:1px solid ${colors.expiryBorder};border-radius:8px;padding:10px 14px;text-align:center;margin-bottom:24px;">
        <p style="margin:0;font-size:12px;color:${colors.textMuted};">
          ${t.expiry}
        </p>
      </div>

      <!-- Divider -->
      <hr style="border:none;border-top:1px solid ${colors.border};margin:0 0 20px;" />

      <!-- Fallback URL -->
      <p style="margin:0 0 6px;font-size:12px;color:${colors.textMuted};text-align:center;">
        ${t.fallback}
      </p>
      <p style="margin:0 0 20px;font-size:11px;color:${colors.text};text-align:center;word-break:break-all;">
        ${resetUrl}
      </p>

      <!-- Disclaimer -->
      <p style="margin:0;font-size:12px;color:${colors.textMuted};text-align:center;line-height:1.6;">
        ${t.disclaimer}
      </p>

    </div>

    <!-- Footer -->
    <p style="text-align:center;color:${colors.textMuted};font-size:11px;margin-top:24px;">
      &copy; ${common.copyright(year)}
    </p>

  </body>
</html>`;
}
