'use client'

import { InstagramIcon, Loading03Icon, MoreVerticalIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

interface ShareInstagramButtonProps {
  shareUrl: string
  mode?: 'icon' | 'button'
  className?: string
}

export function ShareInstagramButton({ shareUrl, mode = 'icon', className }: ShareInstagramButtonProps) {
  const t = useTranslations('share')
  const tCommon = useTranslations('common')
  const { resolvedTheme } = useTheme()
  const sharingRef = useRef(false)
  const fileRef = useRef<File | null>(null)
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const themedShareUrl = useMemo(() => {
    const url = new URL(shareUrl, window.location.origin)
    if (resolvedTheme === 'dark') {
      url.searchParams.set('dark', '1')
    }
    return url.pathname + url.search
  }, [shareUrl, resolvedTheme])

  const fetchImage = useCallback(async (): Promise<File | null> => {
    try {
      const response = await fetch(themedShareUrl)
      if (!response.ok) {
        return null
      }
      const blob = await response.blob()
      return new File([blob], 'goongoom-share.png', { type: 'image/png' })
    } catch (error) {
      console.error('Failed to fetch Instagram share image:', error)
      return null
    }
  }, [themedShareUrl])

  useEffect(() => {
    let cancelled = false

    async function prefetch() {
      const file = await fetchImage()
      if (!cancelled) {
        if (file) {
          fileRef.current = file
        }
        setIsLoading(false)
      }
    }

    prefetch()
    return () => {
      cancelled = true
    }
  }, [fetchImage])

  const shareOrDownload = useCallback(
    async (file: File) => {
      const canShare = navigator.canShare?.({ files: [file] })

      if (canShare) {
        await navigator.share({
          files: [file],
          title: tCommon('appName'),
          text: t('shareToInstagram'),
        })
      } else {
        const url = URL.createObjectURL(file)
        const a = document.createElement('a')
        a.href = url
        a.download = 'goongoom-share.png'
        a.click()
        URL.revokeObjectURL(url)
      }
    },
    [t, tCommon]
  )

  const handleShare = async () => {
    if (sharingRef.current || isLoading) {
      return
    }

    sharingRef.current = true
    setIsLoading(true)

    try {
      let file = fileRef.current
      if (!file) {
        file = await fetchImage()
        if (file) {
          fileRef.current = file
        }
      }

      if (!file) {
        return
      }

      await shareOrDownload(file)
    } catch (error) {
      const isUserCancelled = error instanceof Error && error.name === 'AbortError'
      if (!isUserCancelled && fileRef.current) {
        const url = URL.createObjectURL(fileRef.current)
        const a = document.createElement('a')
        a.href = url
        a.download = 'goongoom-share.png'
        a.click()
        URL.revokeObjectURL(url)
      }
    } finally {
      sharingRef.current = false
      setIsLoading(false)
    }
  }

  if (mode === 'button') {
    return (
      <Button className={className} disabled={isLoading} onClick={handleShare} size="lg" variant="default">
        <HugeiconsIcon
          className={`mr-2 size-5 ${isLoading ? 'animate-spin' : ''}`}
          icon={isLoading ? Loading03Icon : InstagramIcon}
        />
        {isLoading ? t('instagramImageShareLoading') : t('instagramImageShare')}
      </Button>
    )
  }

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <DrawerTrigger asChild>
        <Button aria-label={t('more')} onClick={(e) => e.stopPropagation()} size="icon-xs" variant="ghost">
          <HugeiconsIcon className="size-4" icon={MoreVerticalIcon} />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="pb-safe">
        <DrawerHeader>
          <DrawerTitle>{t('title')}</DrawerTitle>
          <DrawerDescription>{t('instagramDescription')}</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-2 px-4 pb-4">
          <Button
            className="h-14 w-full rounded-2xl font-semibold text-base"
            disabled={isLoading}
            onClick={async () => {
              await handleShare()
              setOpen(false)
            }}
            size="lg"
          >
            {isLoading && <HugeiconsIcon className="mr-2 size-5 animate-spin" icon={Loading03Icon} />}
            {isLoading ? t('instagramImageShareLoading') : t('instagramImageShare')}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
