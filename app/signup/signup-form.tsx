"use client";

import { useActionState } from "react";
import { signup } from "@/app/actions/auth";

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);

  if (state?.success) {
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

      <div className="flex flex-col gap-1">
        <label htmlFor="name">이름</label>
        <input
          id="name"
          name="name"
          required
          className="rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145]"
        />
        {state?.errors?.name?.map((error) => (
          <p key={error} className="text-sm text-red-600">
            {error}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="dateOfBirth">생년월일</label>
        <input
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          required
          className="rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145]"
        />
        {state?.errors?.dateOfBirth?.map((error) => (
          <p key={error} className="text-sm text-red-600">
            {error}
          </p>
        ))}
      </div>

      {state?.message && !state.success && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-foreground px-5 py-2 text-background disabled:opacity-50"
      >
        가입하기
      </button>
    </form>
  );
}
