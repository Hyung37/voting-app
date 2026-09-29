"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import {
  createUser,
  DuplicateEmailError,
  DuplicateIdentityError,
} from "@/lib/users-repository";
import { sendVerificationEmail } from "@/lib/email";

export type SignupState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
        name?: string[];
        dateOfBirth?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

const SignupFormSchema = z.object({
  email: z.string().trim().email({ message: "올바른 이메일을 입력해주세요." }),
  password: z.string().min(8, { message: "비밀번호는 8자 이상이어야 합니다." }),
  name: z.string().trim().min(1, { message: "이름을 입력해주세요." }),
  dateOfBirth: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "올바른 생년월일을 입력해주세요.",
    }),
});

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function signup(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const validatedFields = SignupFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    dateOfBirth: formData.get("dateOfBirth"),
  });

  if (!validatedFields.success) {
    return { errors: z.flattenError(validatedFields.error).fieldErrors };
  }

  const { email, password, name, dateOfBirth } = validatedFields.data;

  const passwordHash = await bcrypt.hash(password, 10);
  const verificationToken = randomBytes(32).toString("hex");
  const verificationTokenExpiresAt = new Date(
    Date.now() + VERIFICATION_TOKEN_TTL_MS,
  );

  try {
    await createUser({
      email,
      passwordHash,
      name,
      dateOfBirth,
      verificationToken,
      verificationTokenExpiresAt,
    });
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      return { errors: { email: ["이미 가입된 이메일입니다."] } };
    }
    if (error instanceof DuplicateIdentityError) {
      return {
        errors: { name: ["이미 같은 이름과 생년월일로 가입된 계정이 있습니다."] },
      };
    }
    throw error;
  }

  try {
    await sendVerificationEmail(email, verificationToken);
  } catch {
    return {
      message: "인증 이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.",
    };
  }

  return {
    success: true,
    message: "가입 확인 이메일을 보냈습니다. 이메일을 확인해주세요.",
  };
}
