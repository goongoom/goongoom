import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { getClerkUserById } from "@/lib/clerk";

async function RedirectToProfile(): Promise<never> {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const user = await getClerkUserById(userId);

  if (!user?.username) {
    redirect("/");
  }

  redirect(`/${user.username}`);
}

export default function MePage() {
  return (
    <Suspense fallback={null}>
      <RedirectToProfile />
    </Suspense>
  );
}
