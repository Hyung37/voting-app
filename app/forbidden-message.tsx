export function ForbiddenMessage({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-32 text-center">
      <h1 className="text-2xl font-semibold">접근 권한이 없습니다</h1>
      <p className="text-zinc-600 dark:text-zinc-400">{children}</p>
    </main>
  );
}
