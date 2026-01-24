import { SignatureColorProvider } from "@/components/theme/signature-color-provider"
import { getClerkUserByUsername } from "@/lib/clerk"
import { getOrCreateUser } from "@/lib/db/queries"

interface ProfileLayoutProps {
  children: React.ReactNode
  params: Promise<{ username: string }>
}

export default async function ProfileLayout({
  children,
  params,
}: ProfileLayoutProps) {
  const { username } = await params

  const clerkUser = await getClerkUserByUsername(username)
  const dbUser = clerkUser ? await getOrCreateUser(clerkUser.clerkId) : null

  return (
    <SignatureColorProvider signatureColor={dbUser?.signatureColor}>
      {children}
    </SignatureColorProvider>
  )
}
