import { verifyOperator } from "@/lib/dal";
import { listVerifiedUsers } from "@/lib/users-repository";
import { setOperatorStatusAction } from "@/app/actions/operators";

export default async function OperatorsPage() {
  await verifyOperator();
  const users = await listVerifiedUsers();

  return (
    <main className="flex flex-1 flex-col items-center gap-8 px-6 py-16">
      <h1 className="text-2xl font-semibold">운영자 권한 관리</h1>
      <ul className="flex w-full max-w-md flex-col gap-2">
        {users.map((user) => (
          <li
            key={user.id}
            className="flex items-center justify-between rounded border border-black/[.08] px-4 py-3 dark:border-white/[.145]"
          >
            <span>{user.email}</span>
            <form action={setOperatorStatusAction}>
              <input type="hidden" name="userId" value={user.id} />
              <input
                type="hidden"
                name="isOperator"
                value={String(!user.isOperator)}
              />
              <button type="submit" className="text-sm underline">
                {user.isOperator ? "운영자 권한 회수" : "운영자 권한 부여"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
