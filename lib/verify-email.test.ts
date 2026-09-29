import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/users-repository", () => ({
  findUserByVerificationToken: vi.fn(),
  markEmailVerified: vi.fn(),
  VerificationConflictError: class VerificationConflictError extends Error {},
}));

import { verifyEmailToken } from "./verify-email";
import {
  findUserByVerificationToken,
  markEmailVerified,
  VerificationConflictError,
} from "@/lib/users-repository";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("verifyEmailToken", () => {
  it("marks the account verified for a valid, unexpired token", async () => {
    vi.mocked(findUserByVerificationToken).mockResolvedValue({
      id: "user-1",
      verificationTokenExpiresAt: new Date(Date.now() + 60_000),
    });

    const result = await verifyEmailToken("valid-token");

    expect(markEmailVerified).toHaveBeenCalledWith("user-1");
    expect(result).toEqual({ status: "verified" });
  });

  it("reports an unknown token as invalid without marking anything verified", async () => {
    vi.mocked(findUserByVerificationToken).mockResolvedValue(null);

    const result = await verifyEmailToken("unknown-token");

    expect(markEmailVerified).not.toHaveBeenCalled();
    expect(result).toEqual({ status: "invalid" });
  });

  it("reports an expired token as expired without marking it verified", async () => {
    vi.mocked(findUserByVerificationToken).mockResolvedValue({
      id: "user-1",
      verificationTokenExpiresAt: new Date(Date.now() - 60_000),
    });

    const result = await verifyEmailToken("expired-token");

    expect(markEmailVerified).not.toHaveBeenCalled();
    expect(result).toEqual({ status: "expired" });
  });

  it("reports invalid when the email or identity was already claimed by another verified account", async () => {
    vi.mocked(findUserByVerificationToken).mockResolvedValue({
      id: "user-1",
      verificationTokenExpiresAt: new Date(Date.now() + 60_000),
    });
    vi.mocked(markEmailVerified).mockRejectedValue(
      new VerificationConflictError(),
    );

    const result = await verifyEmailToken("valid-token");

    expect(result).toEqual({ status: "invalid" });
  });
});
