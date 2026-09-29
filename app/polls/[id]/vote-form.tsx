"use client";

import { useActionState } from "react";
import { castVoteAction } from "@/app/actions/votes";
import type { PollDetail } from "@/lib/polls-repository";

export function VoteForm({ poll }: { poll: PollDetail }) {
  const [state, action, pending] = useActionState(castVoteAction, undefined);

  if (state?.success) {
    return (
      <p className="text-center text-zinc-700 dark:text-zinc-300">
        {state.message}
      </p>
    );
  }

  const inputType = poll.choiceMode === "single" ? "radio" : "checkbox";

  return (
    <form action={action} className="flex w-full max-w-md flex-col gap-3">
      <input type="hidden" name="pollId" value={poll.id} />
      {poll.options.map((option) => (
        <label
          key={option.id}
          className="flex items-center gap-2 rounded border border-black/[.08] px-4 py-3 dark:border-white/[.145]"
        >
          <input type={inputType} name="optionId" value={option.id} />
          {option.label}
        </label>
      ))}

      {state?.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-foreground px-5 py-2 text-background disabled:opacity-50"
      >
        투표하기
      </button>
    </form>
  );
}
