import "server-only";
import { cache } from "react";
import { redirect, forbidden } from "next/navigation";
import { getSession } from "@/lib/session";
import { findUserById } from "@/lib/users-repository";

export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
});

export const verifyOperator = cache(async () => {
  const session = await verifySession();
  const user = await findUserById(session.userId);
  if (!user?.isOperator) {
    forbidden();
  }
  return session;
});
