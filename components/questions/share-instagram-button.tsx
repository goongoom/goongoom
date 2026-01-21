"use client"

import { MoreVerticalIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"

interface ShareInstagramButtonProps {
  shareUrl: string
}

export function ShareInstagramButton({ shareUrl }: ShareInstagramButtonProps) {
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
        // Silently fail on prefetch errors - user can still generate on demand
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
          title: "궁금닷컴",
          text: "궁금닷컴에서 공유",
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
        <Button size="icon-xs" variant="ghost">
          <HugeiconsIcon className="size-4" icon={MoreVerticalIcon} />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="flex flex-col gap-4 pb-8">
        <Button
          className="h-12 w-full font-semibold text-base"
          onClick={() => {
            handleShare()
            setOpen(false)
          }}
        >
          인스타그램 이미지 공유
        </Button>
      </DrawerContent>
    </Drawer>
  )
}
