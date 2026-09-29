import Link from "next/link";
import { notFound } from "next/navigation";
import { findPollById } from "@/lib/polls-repository";
import { getSession } from "@/lib/session";
import { hasVoted } from "@/lib/votes-repository";
import { VoteForm } from "./vote-form";

function isPollOpen(poll: { closedAt: Date | null; deadline: Date | null }) {
  if (poll.closedAt) return false;
  if (poll.deadline && poll.deadline.getTime() <= Date.now()) return false;
  return true;
}

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
  const alreadyVoted = session
    ? await hasVoted(poll.id, session.userId)
    : false;
  const open = isPollOpen(poll);

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-6 py-16">
      <h1 className="max-w-md text-center text-2xl font-semibold">
        {poll.question}
      </h1>

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
    </main>
  );
}
