"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { verifyOperator } from "@/lib/dal";
import { createPoll } from "@/lib/polls-repository";

export type CreatePollState =
  | {
      errors?: {
        question?: string[];
        options?: string[];
        choiceMode?: string[];
        deadline?: string[];
        resultsVisibility?: string[];
      };
    }
  | undefined;

const CreatePollSchema = z.object({
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

export async function createPollAction(
  _prevState: CreatePollState,
  formData: FormData,
): Promise<CreatePollState> {
  const session = await verifyOperator();

  const rawOptions = formData
    .getAll("options")
    .map(String)
    .filter((value) => value.trim() !== "");

  const validatedFields = CreatePollSchema.safeParse({
    question: formData.get("question"),
    options: rawOptions,
    choiceMode: formData.get("choiceMode"),
    deadline: formData.get("deadline") || undefined,
    resultsVisibility: formData.get("resultsVisibility"),
  });

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
