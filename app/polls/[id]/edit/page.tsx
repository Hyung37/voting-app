import { notFound, redirect } from "next/navigation";
import { verifyOperator } from "@/lib/dal";
import { findPollById, hasAnyVotes } from "@/lib/polls-repository";
import { updatePollAction } from "@/app/actions/polls";
import { PollForm } from "../../poll-form";

export default async function EditPollPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await verifyOperator();
  const { id } = await params;
  const poll = await findPollById(id);

  if (!poll) {
    notFound();
  }

  if (await hasAnyVotes(id)) {
    redirect(`/polls/${id}`);
  }

  const boundUpdatePollAction = updatePollAction.bind(null, id);

  return (
    <main className="flex flex-1 flex-col items-center gap-8 px-6 py-16">
      <h1 className="text-2xl font-semibold">폴 수정</h1>
      <PollForm
        action={boundUpdatePollAction}
        submitLabel="수정하기"
        initialValues={{
          question: poll.question,
          options: poll.options.map((option) => option.label),
          choiceMode: poll.choiceMode,
          deadline: poll.deadline
            ? poll.deadline.toISOString().slice(0, 16)
            : null,
          resultsVisibility: poll.resultsVisibility,
        }}
      />
    </main>
  );
}
