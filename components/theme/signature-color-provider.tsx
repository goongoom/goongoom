"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { getSignatureColor } from "@/lib/colors/signature-colors"

interface SignatureColorContextValue {
  signatureColor: string | null | undefined
  setSignatureColor: (color: string) => void
}

const SignatureColorContext = createContext<SignatureColorContextValue | null>(
  null
)

export function useSignatureColor() {
  const context = useContext(SignatureColorContext)
  if (!context) {
    throw new Error(
      "useSignatureColor must be used within SignatureColorProvider"
    )
  }
  return context
}

interface SignatureColorProviderProps {
  children?: React.ReactNode
  signatureColor: string | null | undefined
}

export function SignatureColorProvider({
  children,
  signatureColor: initialColor,
}: SignatureColorProviderProps) {
  const [mounted, setMounted] = useState(false)
  const [signatureColor, setSignatureColorState] = useState(initialColor)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setSignatureColorState(initialColor)
  }, [initialColor])

  const setSignatureColor = useCallback((color: string) => {
    setSignatureColorState(color)
  }, [])

  const contextValue = useMemo(
    () => ({ signatureColor, setSignatureColor }),
    [signatureColor, setSignatureColor]
  )

  const colors = getSignatureColor(signatureColor)

  const colorOverrideCSS = `
    :root {
      --emerald: ${colors.light.primary};
      --success: ${colors.light.primary};
    }
    .dark {
      --emerald: ${colors.dark.primary};
      --success: ${colors.dark.primary};
    }
  `

  if (!mounted) {
    return (
      <SignatureColorContext.Provider value={contextValue}>
        {children}
      </SignatureColorContext.Provider>
    )
  }

  return (
    <SignatureColorContext.Provider value={contextValue}>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: Server-controlled CSS for theme injection */}
      <style dangerouslySetInnerHTML={{ __html: colorOverrideCSS }} />
      {children}
    </SignatureColorContext.Provider>
  )
}
