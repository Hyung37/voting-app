import "server-only";
import {
  findUserByVerificationToken,
  markEmailVerified,
  VerificationConflictError,
} from "@/lib/users-repository";

export type VerifyEmailResult =
  | { status: "verified" }
  | { status: "invalid" }
  | { status: "expired" };

export async function verifyEmailToken(
  token: string,
): Promise<VerifyEmailResult> {
  const user = await findUserByVerificationToken(token);
  if (!user) {
    return { status: "invalid" };
  }

  if (user.verificationTokenExpiresAt.getTime() < Date.now()) {
    return { status: "expired" };
  }

  try {
    await markEmailVerified(user.id);
  } catch (error) {
    if (error instanceof VerificationConflictError) {
      return { status: "invalid" };
    }
    throw error;
  }

  return { status: "verified" };
}
