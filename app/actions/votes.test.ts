import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/dal", () => ({
  verifySession: vi.fn(),
}));
vi.mock("@/lib/polls-repository", () => ({
  findPollById: vi.fn(),
}));
vi.mock("@/lib/votes-repository", () => ({
  castVote: vi.fn(),
  AlreadyVotedError: class AlreadyVotedError extends Error {},
}));

import { castVoteAction } from "./votes";
import { verifySession } from "@/lib/dal";
import { findPollById } from "@/lib/polls-repository";
import { castVote, AlreadyVotedError } from "@/lib/votes-repository";

const basePoll = {
  id: "poll-1",
  question: "q",
  choiceMode: "single" as const,
  deadline: null,
  resultsVisibility: "live" as const,
  closedAt: null,
  createdAt: new Date(),
  options: [
    { id: "opt-1", label: "A", position: 0 },
    { id: "opt-2", label: "B", position: 1 },
  ],
};

function buildFormData(pollId: string, optionIds: string[]) {
  const data = new FormData();
  data.set("pollId", pollId);
  for (const id of optionIds) data.append("optionId", id);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(verifySession).mockResolvedValue({ userId: "voter-1" });
});

describe("castVoteAction", () => {
  it("casts a single-choice vote for an open poll", async () => {
    vi.mocked(findPollById).mockResolvedValue(basePoll);

    const result = await castVoteAction(
      undefined,
      buildFormData("poll-1", ["opt-1"]),
    );

    expect(castVote).toHaveBeenCalledWith("poll-1", "voter-1", ["opt-1"]);
    expect(result?.success).toBe(true);
  });

  it("rejects a vote on a manually closed poll", async () => {
    vi.mocked(findPollById).mockResolvedValue({
      ...basePoll,
      closedAt: new Date(),
    });

    const result = await castVoteAction(
      undefined,
      buildFormData("poll-1", ["opt-1"]),
    );

    expect(castVote).not.toHaveBeenCalled();
    expect(result?.success).toBeFalsy();
  });

  it("rejects a vote past the poll's deadline", async () => {
    vi.mocked(findPollById).mockResolvedValue({
      ...basePoll,
      deadline: new Date(Date.now() - 60_000),
    });

    const result = await castVoteAction(
      undefined,
      buildFormData("poll-1", ["opt-1"]),
    );

    expect(castVote).not.toHaveBeenCalled();
    expect(result?.success).toBeFalsy();
  });

  it("rejects multiple selections on a single-choice poll", async () => {
    vi.mocked(findPollById).mockResolvedValue(basePoll);

    const result = await castVoteAction(
      undefined,
      buildFormData("poll-1", ["opt-1", "opt-2"]),
    );

    expect(castVote).not.toHaveBeenCalled();
    expect(result?.success).toBeFalsy();
  });

  it("allows multiple selections on a multiple-choice poll", async () => {
    vi.mocked(findPollById).mockResolvedValue({
      ...basePoll,
      choiceMode: "multiple",
    });

    const result = await castVoteAction(
      undefined,
      buildFormData("poll-1", ["opt-1", "opt-2"]),
    );

    expect(castVote).toHaveBeenCalledWith("poll-1", "voter-1", [
      "opt-1",
      "opt-2",
    ]);
    expect(result?.success).toBe(true);
  });

  it("reports a friendly message when the account already voted", async () => {
    vi.mocked(findPollById).mockResolvedValue(basePoll);
    vi.mocked(castVote).mockRejectedValue(new AlreadyVotedError());

    const result = await castVoteAction(
      undefined,
      buildFormData("poll-1", ["opt-1"]),
    );

    expect(result?.success).toBeFalsy();
    expect(result?.message).toBeDefined();
  });
});
