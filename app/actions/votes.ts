"use server";

import { verifySession } from "@/lib/dal";
import { findPollById } from "@/lib/polls-repository";
import { castVote, AlreadyVotedError } from "@/lib/votes-repository";
import { isPollOpen } from "@/lib/poll-status";

export type CastVoteState =
  | {
      message?: string;
      success?: boolean;
    }
  | undefined;

export async function castVoteAction(
  _prevState: CastVoteState,
  formData: FormData,
): Promise<CastVoteState> {
  const session = await verifySession();

  const pollId = String(formData.get("pollId") ?? "");
  const selectedOptionIds = [
    ...new Set(formData.getAll("optionId").map(String)),
  ];

  const poll = await findPollById(pollId);
  if (!poll) {
    return { message: "존재하지 않는 폴입니다." };
  }

  if (!isPollOpen(poll)) {
    return { message: "마감된 폴에는 투표할 수 없습니다." };
  }

  if (selectedOptionIds.length === 0) {
    return { message: "선택지를 골라주세요." };
  }

  if (poll.choiceMode === "single" && selectedOptionIds.length > 1) {
    return { message: "하나의 선택지만 고를 수 있습니다." };
  }

  const validOptionIds = new Set(poll.options.map((option) => option.id));
  if (!selectedOptionIds.every((id) => validOptionIds.has(id))) {
    return { message: "올바르지 않은 선택지입니다." };
  }

  try {
    await castVote(pollId, session.userId, selectedOptionIds);
  } catch (error) {
    if (error instanceof AlreadyVotedError) {
      return { message: "이미 이 폴에 투표하셨습니다." };
    }
    throw error;
  }

  return { success: true, message: "투표가 완료되었습니다." };
}
