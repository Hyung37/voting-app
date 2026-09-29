import Link from "next/link";
import { notFound } from "next/navigation";
import {
  findPollById,
  getResultTallies,
  hasAnyVotes,
} from "@/lib/polls-repository";
import { getSession } from "@/lib/session";
import { findUserById } from "@/lib/users-repository";
import { hasVoted } from "@/lib/votes-repository";
import { isPollOpen, canViewResults } from "@/lib/poll-status";
import { deletePollAction, closePollAction } from "@/app/actions/polls";
import { VoteForm } from "./vote-form";
import { LiveResultsRefresher } from "./live-results-refresher";

export default async function PollDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const poll = await findPollById(id);

  if (!poll) {
    notFound();
  }

  const session = await getSession();
  const user = session ? await findUserById(session.userId) : null;
  const alreadyVoted = session
    ? await hasVoted(poll.id, session.userId)
    : false;
  const open = isPollOpen(poll);
  const showResults = canViewResults(poll);
  const tallies = showResults ? await getResultTallies(poll.id) : null;
  const editable = user?.isOperator ? !(await hasAnyVotes(poll.id)) : false;

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-6 py-16">
      {showResults && poll.resultsVisibility === "live" && (
        <LiveResultsRefresher />
      )}

      <h1 className="max-w-md text-center text-2xl font-semibold">
        {poll.question}
      </h1>

      {user?.isOperator && (
        <div className="flex items-center gap-4 text-sm">
          {editable && (
            <Link href={`/polls/${poll.id}/edit`} className="underline">
              수정
            </Link>
          )}
          {open && (
            <form action={closePollAction}>
              <input type="hidden" name="pollId" value={poll.id} />
              <button type="submit" className="underline">
                지금 마감
              </button>
            </form>
          )}
          <form action={deletePollAction}>
            <input type="hidden" name="pollId" value={poll.id} />
            <button type="submit" className="text-red-600 underline">
              삭제
            </button>
          </form>
        </div>
      )}

      {!open ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          마감된 폴입니다. 더 이상 투표할 수 없습니다.
        </p>
      ) : !session ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          <Link href="/login" className="underline">
            로그인
          </Link>
          후 투표할 수 있습니다.
        </p>
      ) : alreadyVoted ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          이미 이 폴에 투표하셨습니다.
        </p>
      ) : (
        <VoteForm poll={poll} />
      )}

      {tallies && (
        <section className="flex w-full max-w-md flex-col gap-2">
          <h2 className="text-lg font-medium">결과</h2>
          <ul className="flex flex-col gap-2">
            {tallies.map((tally) => (
              <li
                key={tally.optionId}
                className="flex items-center justify-between rounded border border-black/[.08] px-4 py-3 dark:border-white/[.145]"
              >
                <span>{tally.label}</span>
                <span className="font-medium">{tally.count}표</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
