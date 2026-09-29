import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-32">
      <h1 className="text-2xl font-semibold">회원가입</h1>
      <SignupForm />
    </main>
  );
}
