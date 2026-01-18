import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";

async function ClerkSignInRedirect() {
  const { redirectToSignIn } = await auth();
  return redirectToSignIn();
}

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <p className="text-sm text-gray-500">로그인 화면으로 이동 중입니다…</p>
      </div>
      <Suspense fallback={null}>
        <ClerkSignInRedirect />
      </Suspense>
    </main>
  );
}
