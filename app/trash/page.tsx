import { verifyOperator } from "@/lib/dal";
import { listTrashedPolls } from "@/lib/polls-repository";
import { restorePollAction, hardDeletePollAction } from "@/app/actions/polls";

export default async function TrashPage() {
  await verifyOperator();
  const polls = await listTrashedPolls();

  return (
    <main className="flex flex-1 flex-col items-center gap-8 px-6 py-16">
      <h1 className="text-2xl font-semibold">휴지통</h1>

      {polls.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          휴지통이 비어 있습니다.
        </p>
      ) : (
        <ul className="flex w-full max-w-md flex-col gap-3">
          {polls.map((poll) => (
            <li
              key={poll.id}
              className="flex items-center justify-between rounded border border-black/[.08] px-4 py-3 dark:border-white/[.145]"
            >
              <span>{poll.question}</span>
              <div className="flex items-center gap-3 text-sm">
                <form action={restorePollAction}>
                  <input type="hidden" name="pollId" value={poll.id} />
                  <button type="submit" className="underline">
                    복원
                  </button>
                </form>
                <form action={hardDeletePollAction}>
                  <input type="hidden" name="pollId" value={poll.id} />
                  <button type="submit" className="text-red-600 underline">
                    영구 삭제
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
