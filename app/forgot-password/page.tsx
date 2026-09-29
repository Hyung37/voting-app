import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-32">
      <h1 className="text-2xl font-semibold">비밀번호 찾기</h1>
      <ForgotPasswordForm />
    </main>
  );
}
