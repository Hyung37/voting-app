"use client";

import { useActionState } from "react";
import { resetPassword } from "@/app/actions/login";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, undefined);

  if (state?.success) {
    return (
      <p className="text-center text-zinc-700 dark:text-zinc-300">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <input type="hidden" name="token" value={token} />

      <div className="flex flex-col gap-1">
        <label htmlFor="password">새 비밀번호</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145]"
        />
        {state?.errors?.password?.map((error) => (
          <p key={error} className="text-sm text-red-600">
            {error}
          </p>
        ))}
      </div>

      {state?.message && !state.errors && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-foreground px-5 py-2 text-background disabled:opacity-50"
      >
        비밀번호 재설정
      </button>
    </form>
  );
}
