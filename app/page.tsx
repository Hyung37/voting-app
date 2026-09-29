import Link from "next/link";
import { listPolls } from "@/lib/polls-repository";

export default async function Home() {
  const polls = await listPolls();

  return (
    <main className="flex flex-1 flex-col items-center gap-8 px-6 py-16">
      <div className="flex w-full max-w-md items-center justify-between">
        <h1 className="text-2xl font-semibold">투표 목록</h1>
        <Link href="/polls/new" className="text-sm underline">
          + 새 폴
        </Link>
      </div>

      {polls.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          아직 생성된 폴이 없습니다.
        </p>
      ) : (
        <ul className="flex w-full max-w-md flex-col gap-3">
          {polls.map((poll) => (
            <li key={poll.id}>
              <Link
                href={`/polls/${poll.id}`}
                className="block rounded border border-black/[.08] px-4 py-3 hover:bg-black/[.02] dark:border-white/[.145] dark:hover:bg-white/[.04]"
              >
                {poll.question}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
