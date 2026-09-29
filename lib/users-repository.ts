import "server-only";
import { sql } from "@/lib/db";

export class DuplicateEmailError extends Error {
  constructor() {
    super("A user with this email already exists.");
  }
}

export class DuplicateIdentityError extends Error {
  constructor() {
    super("A user with this name and date of birth already exists.");
  }
}

export class VerificationConflictError extends Error {
  constructor() {
    super(
      "Another account already verified this email or this name and date of birth.",
    );
  }
}

export type NewUser = {
  email: string;
  passwordHash: string;
  name: string;
  dateOfBirth: string;
  verificationToken: string;
  verificationTokenExpiresAt: Date;
};

export type UserVerificationRecord = {
  id: string;
  verificationTokenExpiresAt: Date;
};

function isUniqueViolation(
  error: unknown,
): error is { code: string; constraint?: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "23505"
  );
}

export async function createUser(input: NewUser): Promise<{ id: string }> {
  try {
    const rows = await sql`
      insert into users (
        email, password_hash, name, date_of_birth,
        verification_token, verification_token_expires_at
      )
      values (
        ${input.email}, ${input.passwordHash}, ${input.name}, ${input.dateOfBirth},
        ${input.verificationToken}, ${input.verificationTokenExpiresAt.toISOString()}
      )
      returning id
    `;
    return rows[0] as { id: string };
  } catch (error) {
    if (isUniqueViolation(error)) {
      if (error.constraint === "users_name_dob_verified_unique") {
        throw new DuplicateIdentityError();
      }
      throw new DuplicateEmailError();
    }
    throw error;
  }
}

export async function findUserByVerificationToken(
  token: string,
): Promise<UserVerificationRecord | null> {
  const rows = await sql`
    select id, verification_token_expires_at as "verificationTokenExpiresAt"
    from users
    where verification_token = ${token}
  `;
  const row = rows[0] as
    | { id: string; verificationTokenExpiresAt: string }
    | undefined;
  if (!row) return null;
  return {
    id: row.id,
    verificationTokenExpiresAt: new Date(row.verificationTokenExpiresAt),
  };
}

export async function markEmailVerified(userId: string): Promise<void> {
  try {
    await sql`
      update users
      set email_verified = true, verification_token = null, verification_token_expires_at = null
      where id = ${userId}
    `;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new VerificationConflictError();
    }
    throw error;
  }
}
