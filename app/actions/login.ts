"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import {
  findVerifiedUserByEmail,
  setPasswordResetToken,
  findUserByResetToken,
  updatePassword,
} from "@/lib/users-repository";
import { createSession, deleteSession } from "@/lib/session";
import { sendPasswordResetEmail } from "@/lib/email";

export type LoginState =
  | {
      errors?: { email?: string[]; password?: string[] };
      message?: string;
    }
  | undefined;

const LoginFormSchema = z.object({
  email: z.string().trim().email({ message: "올바른 이메일을 입력해주세요." }),
  password: z.string().min(1, { message: "비밀번호를 입력해주세요." }),
});

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: z.flattenError(validatedFields.error).fieldErrors };
  }

  const { email, password } = validatedFields.data;

  const user = await findVerifiedUserByEmail(email);
  const passwordMatches = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  if (!user || !passwordMatches) {
    return { message: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}

export type RequestPasswordResetState = { message?: string } | undefined;

const RequestResetSchema = z.object({
  email: z.string().trim().email({ message: "올바른 이메일을 입력해주세요." }),
});

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

const GENERIC_RESET_MESSAGE =
  "해당 이메일로 가입된 계정이 있다면 재설정 메일을 보냈습니다.";

export async function requestPasswordReset(
  _prevState: RequestPasswordResetState,
  formData: FormData,
): Promise<RequestPasswordResetState> {
  const validatedFields = RequestResetSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return { message: GENERIC_RESET_MESSAGE };
  }

  const { email } = validatedFields.data;
  const resetToken = randomBytes(32).toString("hex");
  const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  const user = await setPasswordResetToken(
    email,
    resetToken,
    resetTokenExpiresAt,
  );

  if (user) {
    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch {
      // Still return the generic message: don't leak whether the email
      // exists based on delivery failures.
    }
  }

  return { message: GENERIC_RESET_MESSAGE };
}

export type ResetPasswordState =
  | {
      errors?: { password?: string[] };
      message?: string;
      success?: boolean;
    }
  | undefined;

const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, { message: "비밀번호는 8자 이상이어야 합니다." }),
});

export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const validatedFields = ResetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: z.flattenError(validatedFields.error).fieldErrors };
  }

  const { token, password } = validatedFields.data;

  const record = await findUserByResetToken(token);
  if (!record || record.resetTokenExpiresAt.getTime() < Date.now()) {
    return { message: "유효하지 않거나 만료된 링크입니다. 다시 요청해주세요." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await updatePassword(record.id, passwordHash);

  return {
    success: true,
    message: "비밀번호가 재설정되었습니다. 로그인해주세요.",
  };
}
