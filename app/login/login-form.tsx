"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/app/actions/login";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

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
        {state?.errors?.email?.map((error) => (
          <p key={error} className="text-sm text-red-600">
            {error}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password">비밀번호</label>
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

      {state?.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-foreground px-5 py-2 text-background disabled:opacity-50"
      >
        로그인
      </button>

      <Link href="/forgot-password" className="text-sm text-zinc-600 dark:text-zinc-400">
        비밀번호를 잊으셨나요?
      </Link>
    </form>
  );
}
