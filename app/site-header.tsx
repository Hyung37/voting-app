import Link from "next/link";
import { getSession } from "@/lib/session";
import { findUserById } from "@/lib/users-repository";
import { logout } from "@/app/actions/login";

export async function SiteHeader() {
  const session = await getSession();
  const user = session ? await findUserById(session.userId) : null;

  return (
    <header className="flex items-center justify-between border-b border-black/[.08] px-6 py-4 dark:border-white/[.145]">
      <Link href="/" className="font-semibold">
        투표 앱
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        {session ? (
          <>
            {user?.isOperator && (
              <>
                <Link href="/polls/new">새 폴</Link>
                <Link href="/operators">운영자 관리</Link>
              </>
            )}
            <form action={logout}>
              <button type="submit">로그아웃</button>
            </form>
          </>
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
