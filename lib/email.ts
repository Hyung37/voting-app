import "server-only";
import { Resend } from "resend";

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendVerificationEmail(
  email: string,
  token: string,
): Promise<void> {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const verificationUrl = `${appUrl}/api/verify-email?token=${token}`;

  await getResend().emails.send({
    from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
    to: email,
    subject: "이메일 인증을 완료해주세요",
    html: `<p>아래 링크를 클릭해 이메일 인증을 완료하세요.</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`,
  });
}
