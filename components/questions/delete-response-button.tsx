'use client'

import { useAuth } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
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
  const tErrors = useTranslations('errors')
  const router = useRouter()
  const { userId } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)

  const softDeleteAnswer = useMutation(api.answers.softDelete)
  const restoreAnswer = useMutation(api.answers.restore)

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

      router.push(profileUrl)
      router.refresh()

      toast.success(tAnswers('answerDeleted'), {
        duration: 5000,
        action: {
          label: tCommon('undo'),
          onClick: async () => {
            try {
              await restoreAnswer({
                id: answerId as AnswerId,
                recipientClerkId: userId,
              })
              toast.success(tAnswers('answerRestored'))
              router.refresh()
            } catch {
              toast.error(tErrors('restoreError'))
            }
          },
        },
      })
    } catch (error) {
      console.error('Failed to delete answer:', error)
      toast.error(tErrors('answerDeleteError'))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      className="h-14 w-full rounded-2xl text-destructive"
      disabled={isDeleting}
      onClick={handleDelete}
      type="button"
      variant="outline"
    >
      {isDeleting ? <Spinner className="mr-2 size-4" /> : null}
      {tAnswers('deleteResponse')}
    </Button>
  )
}
