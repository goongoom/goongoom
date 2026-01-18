import { auth } from "@clerk/nextjs/server";

export default async function SignInPage() {
  const { redirectToSignIn } = await auth();
  return redirectToSignIn();
}
