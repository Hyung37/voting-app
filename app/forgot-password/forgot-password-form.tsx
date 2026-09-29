"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/app/actions/login";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    requestPasswordReset,
    undefined,
  );

  if (state?.message) {
    return (
      <p className="text-center text-zinc-700 dark:text-zinc-300">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email">이메일</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145]"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-foreground px-5 py-2 text-background disabled:opacity-50"
      >
        재설정 링크 보내기
      </button>
    </form>
  );
}
