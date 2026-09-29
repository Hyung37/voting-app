import { verifyOperator } from "@/lib/dal";
import { createPollAction } from "@/app/actions/polls";
import { PollForm } from "../poll-form";

export default async function NewPollPage() {
  await verifyOperator();

  return (
    <main className="flex flex-1 flex-col items-center gap-8 px-6 py-16">
      <h1 className="text-2xl font-semibold">새 폴 만들기</h1>
      <PollForm action={createPollAction} submitLabel="폴 만들기" />
    </main>
  );
}
