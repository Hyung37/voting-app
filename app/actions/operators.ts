"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { verifyOperator } from "@/lib/dal";
import { setOperatorStatus } from "@/lib/users-repository";

const SetOperatorStatusSchema = z.object({
  userId: z.string().min(1),
  isOperator: z.enum(["true", "false"]),
});

export async function setOperatorStatusAction(
  formData: FormData,
): Promise<void> {
  await verifyOperator();

  const validatedFields = SetOperatorStatusSchema.parse({
    userId: formData.get("userId"),
    isOperator: formData.get("isOperator"),
  });

  await setOperatorStatus(
    validatedFields.userId,
    validatedFields.isOperator === "true",
  );

  revalidatePath("/operators");
}
