'use client'

import { useAuth } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { api } from '@/convex/_generated/api'
import type { AnswerId } from '@/convex/types'

interface DeleteResponseButtonProps {
  answerId: string
  profileUrl: string
}

export function DeleteResponseButton({ answerId, profileUrl }: DeleteResponseButtonProps) {
  const tAnswers = useTranslations('answers')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const { userId } = useAuth()
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const softDeleteAnswer = useMutation(api.answers.softDelete)

  async function handleDelete() {
    if (isDeleting || !userId) {
      return
    }
    setIsDeleting(true)
    try {
      await softDeleteAnswer({
        id: answerId as AnswerId,
        recipientClerkId: userId,
      })
      setOpen(false)
      router.push(profileUrl)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete answer:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger
        render={<Button className="h-14 w-full rounded-2xl text-destructive" type="button" variant="outline" />}
      >
        {tAnswers('deleteResponse')}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{tAnswers('deleteResponseTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{tAnswers('deleteResponseDescription')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction disabled={isDeleting} onClick={handleDelete} type="button">
            {isDeleting ? <Spinner className="mr-2 size-4" /> : null}
            {tCommon('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
