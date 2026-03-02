interface PasswordResetEmailProps {
  username: string;
  resetUrl: string;
}

export function PasswordResetEmail({ username, resetUrl }: PasswordResetEmailProps): string {
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset your Wave password</title>
  </head>
  <body style="margin:0;padding:48px 20px;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',sans-serif;">

    <!-- Brand -->
    <div style="text-align:center;margin-bottom:28px;">
      <span style="font-size:26px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">Wave</span>
    </div>

    <!-- Card -->
    <div style="background-color:#ffffff;border-radius:16px;padding:48px 40px;max-width:480px;margin:0 auto;box-shadow:0 1px 4px rgba(0,0,0,0.06),0 4px 16px rgba(0,0,0,0.04);">

      <!-- Icon -->
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;width:56px;height:56px;background-color:#f1f5f9;border-radius:50%;font-size:26px;line-height:56px;text-align:center;">🔐</div>
      </div>

      <!-- Heading -->
      <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#0f172a;text-align:center;line-height:1.3;">
        Reset your password
      </h1>

      <!-- Body text -->
      <p style="margin:0 0 32px;font-size:15px;color:#64748b;text-align:center;line-height:1.65;">
        Hey <strong style="color:#0f172a;">${username}</strong>, we received a request to reset your Wave password. Click the button below to choose a new one.
      </p>

      <!-- CTA Button -->
      <div style="text-align:center;margin-bottom:32px;">
        <a href="${resetUrl}" style="display:inline-block;background-color:#0f172a;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:600;font-size:15px;letter-spacing:0.01em;">
          Reset Password
        </a>
      </div>

      <!-- Expiry badge -->
      <div style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;text-align:center;margin-bottom:28px;">
        <p style="margin:0;font-size:13px;color:#92400e;">
          ⏱&nbsp; This link expires in <strong>15 minutes</strong>
        </p>
      </div>

      <!-- Divider -->
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;" />

      <!-- Fallback URL -->
      <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;text-align:center;">
        Button not working? Copy and paste this link:
      </p>
      <p style="margin:0 0 24px;font-size:12px;color:#64748b;text-align:center;word-break:break-all;">
        ${resetUrl}
      </p>

      <!-- Security note -->
      <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;line-height:1.6;">
        If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.
      </p>

    </div>

    <!-- Footer -->
    <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:28px;line-height:1.6;">
      &copy; ${year} Wave &middot; All rights reserved
    </p>

  </body>
</html>`;
}
