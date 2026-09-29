import { notFound } from "next/navigation";
import { findPollById } from "@/lib/polls-repository";

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

  return (
    <main className="flex flex-1 flex-col items-center gap-6 px-6 py-16">
      <h1 className="max-w-md text-center text-2xl font-semibold">
        {poll.question}
      </h1>
      <ul className="flex w-full max-w-md flex-col gap-2">
        {poll.options.map((option) => (
          <li
            key={option.id}
            className="rounded border border-black/[.08] px-4 py-3 dark:border-white/[.145]"
          >
            {option.label}
          </li>
        ))}
      </ul>
    </main>
  );
}
