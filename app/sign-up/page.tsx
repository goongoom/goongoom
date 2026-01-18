import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";

async function ClerkSignUpRedirect() {
  const { redirectToSignUp } = await auth();
  return redirectToSignUp();
}

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <p className="text-sm text-gray-500">회원가입 화면으로 이동 중입니다…</p>
      </div>
      <Suspense fallback={null}>
        <ClerkSignUpRedirect />
      </Suspense>
    </main>
  );
}
