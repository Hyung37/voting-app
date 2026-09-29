import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/dal", () => ({
  verifyOperator: vi.fn(),
}));
vi.mock("@/lib/polls-repository", () => ({
  createPoll: vi.fn(),
  updatePoll: vi.fn(),
  softDeletePoll: vi.fn(),
  hasAnyVotes: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import {
  createPollAction,
  updatePollAction,
  deletePollAction,
} from "./polls";
import { verifyOperator } from "@/lib/dal";
import {
  createPoll,
  updatePoll,
  softDeletePoll,
  hasAnyVotes,
} from "@/lib/polls-repository";
import { redirect } from "next/navigation";

function buildFormData(overrides: {
  question?: string;
  options?: string[];
  choiceMode?: string;
  deadline?: string;
  resultsVisibility?: string;
} = {}) {
  const data = new FormData();
  data.set("question", overrides.question ?? "가장 좋아하는 색은?");
  for (const option of overrides.options ?? ["빨강", "파랑"]) {
    data.append("options", option);
  }
  data.set("choiceMode", overrides.choiceMode ?? "single");
  if (overrides.deadline) data.set("deadline", overrides.deadline);
  data.set("resultsVisibility", overrides.resultsVisibility ?? "live");
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createPollAction", () => {
  it("does not create a poll when the caller is not an operator", async () => {
    vi.mocked(verifyOperator).mockRejectedValue(new Error("forbidden"));

    await expect(
      createPollAction(undefined, buildFormData()),
    ).rejects.toThrow();

    expect(createPoll).not.toHaveBeenCalled();
  });

  it("creates the poll and redirects to it for a valid operator submission", async () => {
    vi.mocked(verifyOperator).mockResolvedValue({ userId: "operator-1" });
    vi.mocked(createPoll).mockResolvedValue({ id: "poll-1" });

    await createPollAction(undefined, buildFormData());

    expect(createPoll).toHaveBeenCalledWith(
      expect.objectContaining({
        question: "가장 좋아하는 색은?",
        options: ["빨강", "파랑"],
        choiceMode: "single",
        resultsVisibility: "live",
        createdBy: "operator-1",
      }),
    );
    expect(redirect).toHaveBeenCalledWith("/polls/poll-1");
  });

  it("rejects fewer than two options without creating a poll", async () => {
    vi.mocked(verifyOperator).mockResolvedValue({ userId: "operator-1" });

    const result = await createPollAction(
      undefined,
      buildFormData({ options: ["only-one"] }),
    );

    expect(result?.errors?.options).toBeDefined();
    expect(createPoll).not.toHaveBeenCalled();
  });

  it("rejects an empty question without creating a poll", async () => {
    vi.mocked(verifyOperator).mockResolvedValue({ userId: "operator-1" });

    const result = await createPollAction(
      undefined,
      buildFormData({ question: "   " }),
    );

    expect(result?.errors?.question).toBeDefined();
    expect(createPoll).not.toHaveBeenCalled();
  });
});

describe("updatePollAction", () => {
  it("updates an unvoted poll and redirects to it", async () => {
    vi.mocked(verifyOperator).mockResolvedValue({ userId: "operator-1" });
    vi.mocked(hasAnyVotes).mockResolvedValue(false);

    await updatePollAction("poll-1", undefined, buildFormData());

    expect(updatePoll).toHaveBeenCalledWith(
      "poll-1",
      expect.objectContaining({ question: "가장 좋아하는 색은?" }),
    );
    expect(redirect).toHaveBeenCalledWith("/polls/poll-1");
  });

  it("refuses to edit a poll that already has votes", async () => {
    vi.mocked(verifyOperator).mockResolvedValue({ userId: "operator-1" });
    vi.mocked(hasAnyVotes).mockResolvedValue(true);

    const result = await updatePollAction(
      "poll-1",
      undefined,
      buildFormData(),
    );

    expect(updatePoll).not.toHaveBeenCalled();
    expect(result?.message).toBeDefined();
  });
});

describe("deletePollAction", () => {
  it("soft-deletes the poll regardless of vote count and redirects home", async () => {
    vi.mocked(verifyOperator).mockResolvedValue({ userId: "operator-1" });

    const data = new FormData();
    data.set("pollId", "poll-1");
    await deletePollAction(data);

    expect(softDeletePoll).toHaveBeenCalledWith("poll-1");
    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("does not delete when the caller is not an operator", async () => {
    vi.mocked(verifyOperator).mockRejectedValue(new Error("forbidden"));

    const data = new FormData();
    data.set("pollId", "poll-1");
    await expect(deletePollAction(data)).rejects.toThrow();

    expect(softDeletePoll).not.toHaveBeenCalled();
  });
});
