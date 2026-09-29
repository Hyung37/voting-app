const MESSAGES: Record<string, { title: string; body: string }> = {
  verified: {
    title: "이메일 인증 완료",
    body: "이메일 인증이 완료되었습니다. 이제 로그인할 수 있습니다.",
  },
  expired: {
    title: "인증 링크 만료",
    body: "인증 링크가 만료되었습니다. 다시 가입을 시도해주세요.",
  },
  invalid: {
    title: "유효하지 않은 링크",
    body: "유효하지 않은 인증 링크입니다.",
  },
};

export default async function VerifyEmailStatusPage({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  const { status } = await params;
  const message = MESSAGES[status] ?? MESSAGES.invalid;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-32 text-center">
      <h1 className="text-2xl font-semibold">{message.title}</h1>
      <p className="text-zinc-600 dark:text-zinc-400">{message.body}</p>
    </main>
  );
}
