import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/lib/verify-email";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  const result = token
    ? await verifyEmailToken(token)
    : ({ status: "invalid" } as const);

  return NextResponse.redirect(
    new URL(`/verify-email/${result.status}`, request.nextUrl),
  );
}
