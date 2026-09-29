import Link from "next/link";
import { getSession } from "@/lib/session";
import { logout } from "@/app/actions/login";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="flex items-center justify-between border-b border-black/[.08] px-6 py-4 dark:border-white/[.145]">
      <Link href="/" className="font-semibold">
        투표 앱
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        {session ? (
          <form action={logout}>
            <button type="submit">로그아웃</button>
          </form>
        ) : (
          <>
            <Link href="/login">로그인</Link>
            <Link href="/signup">회원가입</Link>
          </>
        )}
      </nav>
    </header>
  );
}
