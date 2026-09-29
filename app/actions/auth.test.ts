import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/users-repository", () => ({
  createUser: vi.fn(),
  DuplicateEmailError: class DuplicateEmailError extends Error {},
  DuplicateIdentityError: class DuplicateIdentityError extends Error {},
}));
vi.mock("@/lib/email", () => ({
  sendVerificationEmail: vi.fn(),
}));

import { signup } from "./auth";
import {
  createUser,
  DuplicateEmailError,
  DuplicateIdentityError,
} from "@/lib/users-repository";
import { sendVerificationEmail } from "@/lib/email";

function buildFormData(overrides: Record<string, string> = {}) {
  const defaults = {
    email: "jane@example.com",
    password: "correct-horse-battery-staple1!",
    name: "Jane Doe",
    dateOfBirth: "1990-01-01",
  };
  const data = new FormData();
  for (const [key, value] of Object.entries({ ...defaults, ...overrides })) {
    data.set(key, value);
  }
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("signup", () => {
  it("creates a user and sends a verification email for valid input", async () => {
    vi.mocked(createUser).mockResolvedValue({ id: "user-1" });

    const result = await signup(undefined, buildFormData());

    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "jane@example.com",
        name: "Jane Doe",
        dateOfBirth: "1990-01-01",
      }),
    );
    expect(sendVerificationEmail).toHaveBeenCalledWith(
      "jane@example.com",
      expect.any(String),
    );
    expect(result?.message).toBeDefined();
    expect(result?.errors).toBeUndefined();
    expect(result?.success).toBe(true);
  });

  it("rejects an invalid email without touching the database or sending mail", async () => {
    const result = await signup(undefined, buildFormData({ email: "not-an-email" }));

    expect(result?.errors?.email).toBeDefined();
    expect(createUser).not.toHaveBeenCalled();
    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });

  it("reports a duplicate email without sending mail", async () => {
    vi.mocked(createUser).mockRejectedValue(new DuplicateEmailError());

    const result = await signup(undefined, buildFormData());

    expect(result?.errors?.email).toBeDefined();
    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });

  it("reports a duplicate name + date of birth without sending mail", async () => {
    vi.mocked(createUser).mockRejectedValue(new DuplicateIdentityError());

    const result = await signup(undefined, buildFormData());

    expect(result?.errors?.name).toBeDefined();
    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });

  it("returns a friendly message instead of throwing when the verification email fails to send", async () => {
    vi.mocked(createUser).mockResolvedValue({ id: "user-1" });
    vi.mocked(sendVerificationEmail).mockRejectedValue(new Error("network"));

    const result = await signup(undefined, buildFormData());

    expect(result?.message).toBeDefined();
    expect(result?.success).toBeFalsy();
  });
});
