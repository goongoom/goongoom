import { auth } from "@clerk/nextjs/server";

export default async function SignUpPage() {
  const { redirectToSignUp } = await auth();
  return redirectToSignUp();
}
