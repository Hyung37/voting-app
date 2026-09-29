import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";

vi.mock("@/lib/users-repository", () => ({
  findVerifiedUserByEmail: vi.fn(),
  setPasswordResetToken: vi.fn(),
  findUserByResetToken: vi.fn(),
  updatePassword: vi.fn(),
}));
vi.mock("@/lib/session", () => ({
  createSession: vi.fn(),
  deleteSession: vi.fn(),
}));
vi.mock("@/lib/email", () => ({
  sendPasswordResetEmail: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import { login, requestPasswordReset, resetPassword } from "./login";
import {
  findVerifiedUserByEmail,
  setPasswordResetToken,
  findUserByResetToken,
  updatePassword,
} from "@/lib/users-repository";
import { createSession } from "@/lib/session";
import { sendPasswordResetEmail } from "@/lib/email";
import { redirect } from "next/navigation";

function buildFormData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.set(key, value);
  }
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("login", () => {
  it("creates a session and redirects home for correct credentials", async () => {
    const passwordHash = await bcrypt.hash("correct-password1!", 10);
    vi.mocked(findVerifiedUserByEmail).mockResolvedValue({
      id: "user-1",
      passwordHash,
    });

    await login(
      undefined,
      buildFormData({ email: "jane@example.com", password: "correct-password1!" }),
    );

    expect(createSession).toHaveBeenCalledWith("user-1");
    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("rejects a wrong password without creating a session", async () => {
    const passwordHash = await bcrypt.hash("correct-password1!", 10);
    vi.mocked(findVerifiedUserByEmail).mockResolvedValue({
      id: "user-1",
      passwordHash,
    });

    const result = await login(
      undefined,
      buildFormData({ email: "jane@example.com", password: "wrong-password" }),
    );

    expect(createSession).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
    expect(result?.message).toBeDefined();
  });

  it("rejects an unverified or unknown account the same way as a wrong password", async () => {
    vi.mocked(findVerifiedUserByEmail).mockResolvedValue(null);

    const result = await login(
      undefined,
      buildFormData({ email: "unverified@example.com", password: "whatever1!" }),
    );

    expect(createSession).not.toHaveBeenCalled();
    expect(result?.message).toBeDefined();
  });
});

describe("requestPasswordReset", () => {
  it("sends a reset email for a known, verified account", async () => {
    vi.mocked(setPasswordResetToken).mockResolvedValue({ id: "user-1" });

    const result = await requestPasswordReset(
      undefined,
      buildFormData({ email: "jane@example.com" }),
    );

    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      "jane@example.com",
      expect.any(String),
    );
    expect(result?.message).toBeDefined();
  });

  it("returns the same generic message for an unknown account without sending mail", async () => {
    vi.mocked(setPasswordResetToken).mockResolvedValue(null);

    const result = await requestPasswordReset(
      undefined,
      buildFormData({ email: "unknown@example.com" }),
    );

    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    expect(result?.message).toBeDefined();
  });
});

describe("resetPassword", () => {
  it("updates the password for a valid, unexpired token", async () => {
    vi.mocked(findUserByResetToken).mockResolvedValue({
      id: "user-1",
      resetTokenExpiresAt: new Date(Date.now() + 60_000),
    });

    const result = await resetPassword(
      undefined,
      buildFormData({ token: "valid-token", password: "new-password1!" }),
    );

    expect(updatePassword).toHaveBeenCalledWith(
      "user-1",
      expect.any(String),
    );
    expect(result?.success).toBe(true);
  });

  it("rejects an expired token without updating the password", async () => {
    vi.mocked(findUserByResetToken).mockResolvedValue({
      id: "user-1",
      resetTokenExpiresAt: new Date(Date.now() - 60_000),
    });

    const result = await resetPassword(
      undefined,
      buildFormData({ token: "expired-token", password: "new-password1!" }),
    );

    expect(updatePassword).not.toHaveBeenCalled();
    expect(result?.success).toBeFalsy();
  });
});
