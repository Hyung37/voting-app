import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/dal", () => ({
  verifyOperator: vi.fn(),
}));
vi.mock("@/lib/users-repository", () => ({
  setOperatorStatus: vi.fn(),
}));
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { setOperatorStatusAction } from "./operators";
import { verifyOperator } from "@/lib/dal";
import { setOperatorStatus } from "@/lib/users-repository";

function buildFormData(userId: string, isOperator: boolean) {
  const data = new FormData();
  data.set("userId", userId);
  data.set("isOperator", String(isOperator));
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("setOperatorStatusAction", () => {
  it("does not change anything when the caller is not an operator", async () => {
    vi.mocked(verifyOperator).mockRejectedValue(new Error("forbidden"));

    await expect(
      setOperatorStatusAction(buildFormData("user-2", true)),
    ).rejects.toThrow();

    expect(setOperatorStatus).not.toHaveBeenCalled();
  });

  it("grants operator permission to the target account", async () => {
    vi.mocked(verifyOperator).mockResolvedValue({ userId: "operator-1" });

    await setOperatorStatusAction(buildFormData("user-2", true));

    expect(setOperatorStatus).toHaveBeenCalledWith("user-2", true);
  });

  it("revokes operator permission from the target account", async () => {
    vi.mocked(verifyOperator).mockResolvedValue({ userId: "operator-1" });

    await setOperatorStatusAction(buildFormData("user-2", false));

    expect(setOperatorStatus).toHaveBeenCalledWith("user-2", false);
  });
});
