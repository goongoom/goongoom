"use client"

import { useClerk, useSignIn } from "@clerk/nextjs"
import type { ReactNode } from "react"
import { useCallback, useState } from "react"

interface PasskeySignInButtonProps {
  children: ReactNode
}

export function PasskeySignInButton({ children }: PasskeySignInButtonProps) {
  const { signIn, setActive } = useSignIn()
  const clerk = useClerk()
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const handleSignIn = useCallback(async () => {
    if (!signIn || isAuthenticating) {
      return
    }

    setIsAuthenticating(true)

    try {
      const result = await signIn.authenticateWithPasskey({
        flow: "discoverable",
      })

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId })
        return
      }

      clerk.openSignIn()
    } catch {
      clerk.openSignIn()
    } finally {
      setIsAuthenticating(false)
    }
  }, [signIn, setActive, clerk, isAuthenticating])

  return (
    <button className="contents" onClick={handleSignIn} type="button">
      {children}
    </button>
  )
}
