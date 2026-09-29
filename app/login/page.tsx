import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-32">
      <h1 className="text-2xl font-semibold">로그인</h1>
      <LoginForm />
    </main>
  );
}
