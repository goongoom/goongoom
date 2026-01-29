'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getSignatureColor, isValidSignatureColor } from '@/lib/colors/signature-colors'

interface SignatureColorContextValue {
  signatureColor: string | null | undefined
  setSignatureColor: (color: string) => void
}

const SignatureColorContext = createContext<SignatureColorContextValue | null>(null)

export function useSignatureColor() {
  const context = useContext(SignatureColorContext)
  if (!context) {
    throw new Error('useSignatureColor must be used within SignatureColorProvider')
  }
  return context
}

let nextRegistryId = 0
const metaThemeRegistry = new Map<number, string>()

function applyMetaThemeColor() {
  if (typeof document === 'undefined' || metaThemeRegistry.size === 0) return
  const maxId = Math.max(...metaThemeRegistry.keys())
  const color = metaThemeRegistry.get(maxId)
  if (!color) return

  const lightMeta = document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: light)"]')
  if (lightMeta) lightMeta.setAttribute('content', color)
}

function registerMetaTheme(id: number, color: string) {
  metaThemeRegistry.set(id, color)
  applyMetaThemeColor()
}

function unregisterMetaTheme(id: number) {
  metaThemeRegistry.delete(id)
  applyMetaThemeColor()
}

interface SignatureColorProviderProps {
  children?: React.ReactNode
  signatureColor: string | null | undefined
}

export function SignatureColorProvider({ children, signatureColor: initialColor }: SignatureColorProviderProps) {
  const [mounted, setMounted] = useState(false)
  const [signatureColor, setSignatureColorState] = useState(initialColor)
  const registryId = useRef(-1)
  if (registryId.current === -1) {
    registryId.current = nextRegistryId++
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setSignatureColorState(initialColor)
  }, [initialColor])

  useEffect(() => {
    const colors = getSignatureColor(signatureColor)
    registerMetaTheme(registryId.current, colors.light.primary)
    return () => {
      unregisterMetaTheme(registryId.current)
    }
  }, [signatureColor])

  const setSignatureColor = useCallback((color: string) => {
    setSignatureColorState(color)
  }, [])

  const contextValue = useMemo(() => ({ signatureColor, setSignatureColor }), [signatureColor, setSignatureColor])

  const colors = getSignatureColor(signatureColor)
  const hasExplicitColor = signatureColor != null && isValidSignatureColor(signatureColor)

  const colorOverrideCSS = `
    :root {
      --success: ${colors.light.primary};
      --primary: ${colors.light.primary};
      --primary-foreground: #ffffff;
      --ring: ${colors.light.primary};
      --sidebar-primary: ${colors.light.primary};
      --sidebar-primary-foreground: #ffffff;
      ${hasExplicitColor ? `--selection-color: ${colors.light.primary};` : ''}
    }
    .dark {
      --success: ${colors.dark.primary};
      --primary: ${colors.dark.primary};
      --primary-foreground: #ffffff;
      --ring: ${colors.dark.primary};
      --sidebar-primary: ${colors.dark.primary};
      --sidebar-primary-foreground: #ffffff;
      ${hasExplicitColor ? `--selection-color: ${colors.dark.primary};` : ''}
    }
  `

  if (!mounted) {
    return <SignatureColorContext.Provider value={contextValue}>{children}</SignatureColorContext.Provider>
  }

  return (
    <SignatureColorContext.Provider value={contextValue}>
      <style dangerouslySetInnerHTML={{ __html: colorOverrideCSS }} />
      {children}
    </SignatureColorContext.Provider>
  )
}
