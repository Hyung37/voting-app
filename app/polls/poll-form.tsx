"use client";

import { useActionState, useState } from "react";
import type { PollFormState } from "@/app/actions/polls";

type PollFormAction = (
  state: PollFormState,
  formData: FormData,
) => Promise<PollFormState>;

export type PollFormInitialValues = {
  question: string;
  options: string[];
  choiceMode: "single" | "multiple";
  deadline: string | null;
  resultsVisibility: "live" | "after_close";
};

export function PollForm({
  action,
  initialValues,
  submitLabel,
}: {
  action: PollFormAction;
  initialValues?: PollFormInitialValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [options, setOptions] = useState(initialValues?.options ?? ["", ""]);
  const [hasDeadline, setHasDeadline] = useState(
    Boolean(initialValues?.deadline),
  );

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="question">질문</label>
        <input
          id="question"
          name="question"
          defaultValue={initialValues?.question}
          required
          className="rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145]"
        />
        {state?.errors?.question?.map((error) => (
          <p key={error} className="text-sm text-red-600">
            {error}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <span>선택지</span>
        {options.map((value, index) => (
          <input
            key={index}
            name="options"
            value={value}
            onChange={(event) => {
              const next = [...options];
              next[index] = event.target.value;
              setOptions(next);
            }}
            placeholder={`선택지 ${index + 1}`}
            className="rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145]"
          />
        ))}
        <button
          type="button"
          onClick={() => setOptions([...options, ""])}
          className="self-start text-sm text-zinc-600 underline dark:text-zinc-400"
        >
          + 선택지 추가
        </button>
        {state?.errors?.options?.map((error) => (
          <p key={error} className="text-sm text-red-600">
            {error}
          </p>
        ))}
      </div>

      <fieldset className="flex flex-col gap-1">
        <legend>선택 방식</legend>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="choiceMode"
            value="single"
            defaultChecked={(initialValues?.choiceMode ?? "single") === "single"}
          />
          단일 선택
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="choiceMode"
            value="multiple"
            defaultChecked={initialValues?.choiceMode === "multiple"}
          />
          다중 선택
        </label>
      </fieldset>

      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={hasDeadline}
            onChange={(event) => setHasDeadline(event.target.checked)}
          />
          마감일 지정 (선택하지 않으면 무기한)
        </label>
        {hasDeadline && (
          <input
            type="datetime-local"
            name="deadline"
            defaultValue={initialValues?.deadline ?? undefined}
            className="rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145]"
          />
        )}
        {state?.errors?.deadline?.map((error) => (
          <p key={error} className="text-sm text-red-600">
            {error}
          </p>
        ))}
      </div>

      <fieldset className="flex flex-col gap-1">
        <legend>결과 공개 방식</legend>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="resultsVisibility"
            value="live"
            defaultChecked={
              (initialValues?.resultsVisibility ?? "live") === "live"
            }
          />
          실시간 공개
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="resultsVisibility"
            value="after_close"
            defaultChecked={initialValues?.resultsVisibility === "after_close"}
          />
          마감 후 공개
        </label>
      </fieldset>

      {state?.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-foreground px-5 py-2 text-background disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </form>
  );
}
