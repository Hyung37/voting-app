"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { verifyOperator } from "@/lib/dal";
import {
  createPoll,
  updatePoll,
  softDeletePoll,
  hasAnyVotes,
  restorePoll,
  hardDeletePoll,
  closePoll,
} from "@/lib/polls-repository";

export type PollFormState =
  | {
      errors?: {
        question?: string[];
        options?: string[];
        choiceMode?: string[];
        deadline?: string[];
        resultsVisibility?: string[];
      };
      message?: string;
    }
  | undefined;

const PollFormSchema = z.object({
  question: z.string().trim().min(1, { message: "질문을 입력해주세요." }),
  options: z
    .array(z.string().trim().min(1))
    .min(2, { message: "선택지를 2개 이상 입력해주세요." }),
  choiceMode: z.enum(["single", "multiple"], {
    message: "선택 방식을 골라주세요.",
  }),
  deadline: z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
      message: "올바른 마감일을 입력해주세요.",
    }),
  resultsVisibility: z.enum(["live", "after_close"], {
    message: "결과 공개 방식을 골라주세요.",
  }),
});

function parsePollForm(formData: FormData) {
  const rawOptions = formData
    .getAll("options")
    .map(String)
    .filter((value) => value.trim() !== "");

  return PollFormSchema.safeParse({
    question: formData.get("question"),
    options: rawOptions,
    choiceMode: formData.get("choiceMode"),
    deadline: formData.get("deadline") || undefined,
    resultsVisibility: formData.get("resultsVisibility"),
  });
}

export type CreatePollState = PollFormState;

export async function createPollAction(
  _prevState: CreatePollState,
  formData: FormData,
): Promise<CreatePollState> {
  const session = await verifyOperator();

  const validatedFields = parsePollForm(formData);
  if (!validatedFields.success) {
    return { errors: z.flattenError(validatedFields.error).fieldErrors };
  }

  const { question, options, choiceMode, deadline, resultsVisibility } =
    validatedFields.data;

  const poll = await createPoll({
    question,
    options,
    choiceMode,
    deadline: deadline ? new Date(deadline) : null,
    resultsVisibility,
    createdBy: session.userId,
  });

  redirect(`/polls/${poll.id}`);
}

export type UpdatePollState = PollFormState;

export async function updatePollAction(
  pollId: string,
  _prevState: UpdatePollState,
  formData: FormData,
): Promise<UpdatePollState> {
  await verifyOperator();

  if (await hasAnyVotes(pollId)) {
    return {
      message: "이미 투표가 들어온 폴은 수정할 수 없습니다. 삭제만 가능합니다.",
    };
  }

  const validatedFields = parsePollForm(formData);
  if (!validatedFields.success) {
    return { errors: z.flattenError(validatedFields.error).fieldErrors };
  }

  const { question, options, choiceMode, deadline, resultsVisibility } =
    validatedFields.data;

  await updatePoll(pollId, {
    question,
    options,
    choiceMode,
    deadline: deadline ? new Date(deadline) : null,
    resultsVisibility,
  });

  redirect(`/polls/${pollId}`);
}

async function operatorPollAction(
  formData: FormData,
  operation: (pollId: string) => Promise<void>,
  redirectTo: (pollId: string) => string,
): Promise<void> {
  await verifyOperator();
  const pollId = String(formData.get("pollId") ?? "");
  await operation(pollId);
  redirect(redirectTo(pollId));
}

export async function deletePollAction(formData: FormData): Promise<void> {
  await operatorPollAction(formData, softDeletePoll, () => "/");
}

export async function restorePollAction(formData: FormData): Promise<void> {
  await operatorPollAction(formData, restorePoll, () => "/trash");
}

export async function hardDeletePollAction(formData: FormData): Promise<void> {
  await operatorPollAction(formData, hardDeletePoll, () => "/trash");
}

export async function closePollAction(formData: FormData): Promise<void> {
  await operatorPollAction(
    formData,
    closePoll,
    (pollId) => `/polls/${pollId}`,
  );
}
