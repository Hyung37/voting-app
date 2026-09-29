import { verifyOperator } from "@/lib/dal";
import { CreatePollForm } from "./create-poll-form";

export default async function NewPollPage() {
  await verifyOperator();

  return (
    <main className="flex flex-1 flex-col items-center gap-8 px-6 py-16">
      <h1 className="text-2xl font-semibold">새 폴 만들기</h1>
      <CreatePollForm />
    </main>
  );
}
