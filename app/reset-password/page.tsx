import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-32">
      <h1 className="text-2xl font-semibold">비밀번호 재설정</h1>
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p className="text-red-600">유효하지 않은 링크입니다.</p>
      )}
    </main>
  );
}
