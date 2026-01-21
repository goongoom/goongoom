"use client"

import { MoreVerticalIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

interface ShareInstagramButtonProps {
  shareUrl: string
}

export function ShareInstagramButton({ shareUrl }: ShareInstagramButtonProps) {
  const t = useTranslations("share")
  const tCommon = useTranslations("common")
  const sharingRef = useRef(false)
  const fileRef = useRef<File | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function prefetch() {
      try {
        const response = await fetch(shareUrl)
        if (cancelled) {
          return
        }
        if (!response.ok) {
          return
        }

        const blob = await response.blob()
        if (cancelled) {
          return
        }

        fileRef.current = new File([blob], "goongoom-share.png", {
          type: "image/png",
        })
      } catch (error) {
        console.error("Failed to prefetch Instagram share image:", error)
      }
    }

    prefetch()
    return () => {
      cancelled = true
    }
  }, [shareUrl])

  const handleShare = async () => {
    if (sharingRef.current) {
      return
    }

    if (!fileRef.current) {
      window.open(shareUrl, "_blank")
      return
    }

    sharingRef.current = true

    try {
      const canShare = navigator.canShare?.({ files: [fileRef.current] })

      if (canShare) {
        await navigator.share({
          files: [fileRef.current],
          title: tCommon("appName"),
          text: t("shareToInstagram"),
        })
      } else {
        const url = URL.createObjectURL(fileRef.current)
        const a = document.createElement("a")
        a.href = url
        a.download = "goongoom-share.png"
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      const isUserCancelled =
        error instanceof Error && error.name === "AbortError"
      if (!isUserCancelled && fileRef.current) {
        const url = URL.createObjectURL(fileRef.current)
        const a = document.createElement("a")
        a.href = url
        a.download = "goongoom-share.png"
        a.click()
        URL.revokeObjectURL(url)
      }
    } finally {
      sharingRef.current = false
    }
  }

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <DrawerTrigger asChild>
        <Button
          aria-label={t("more")}
          onClick={(e) => e.stopPropagation()}
          size="icon-xs"
          variant="ghost"
        >
          <HugeiconsIcon className="size-4" icon={MoreVerticalIcon} />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="pb-safe">
        <DrawerHeader>
          <DrawerTitle>{t("title")}</DrawerTitle>
          <DrawerDescription>{t("instagramDescription")}</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-2 px-4 pb-4">
          <Button
            className="w-full font-semibold text-base"
            onClick={() => {
              handleShare()
              setOpen(false)
            }}
            size="lg"
          >
            {t("instagramImageShare")}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
