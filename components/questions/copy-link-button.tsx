"use client"

import { CheckmarkCircle02Icon, Link01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"
import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"

interface CopyLinkButtonProps {
  url: string
}

export function CopyLinkButton({ url }: CopyLinkButtonProps) {
  const t = useTranslations("share")
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      e.preventDefault()
      try {
        const fullUrl = `${window.location.origin}${url}`
        await navigator.clipboard.writeText(fullUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        const textArea = document.createElement("textarea")
        textArea.value = `${window.location.origin}${url}`
        textArea.style.position = "fixed"
        textArea.style.left = "-9999px"
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    },
    [url]
  )

  return (
    <Button
      aria-label={copied ? t("linkCopied") : t("copyLink")}
      onClick={handleCopy}
      size="icon-xs"
      variant="ghost"
    >
      <HugeiconsIcon
        className="size-4"
        icon={copied ? CheckmarkCircle02Icon : Link01Icon}
      />
    </Button>
  )
}
