import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/dal", () => ({
  verifyOperator: vi.fn(),
}));
vi.mock("@/lib/polls-repository", () => ({
  createPoll: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import { createPollAction } from "./polls";
import { verifyOperator } from "@/lib/dal";
import { createPoll } from "@/lib/polls-repository";
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
