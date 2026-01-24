"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { deleteAnswer } from "@/lib/actions/answers"

interface DeleteResponseButtonProps {
  answerId: string
  profileUrl: string
}

export function DeleteResponseButton({
  answerId,
  profileUrl,
}: DeleteResponseButtonProps) {
  const tAnswers = useTranslations("answers")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (isDeleting) {
      return
    }
    setIsDeleting(true)
    try {
      const result = await deleteAnswer({ answerId })
      if (result.success) {
        setOpen(false)
        router.push(profileUrl)
        router.refresh()
      }
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger
        render={
          <Button
            className="h-14 w-full rounded-xl text-destructive"
            type="button"
            variant="outline"
          />
        }
      >
        {tAnswers("deleteResponse")}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{tAnswers("deleteResponseTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {tAnswers("deleteResponseDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
            onClick={handleDelete}
            type="button"
          >
            {isDeleting ? (
              <Spinner className="mr-2 size-4 text-destructive-foreground" />
            ) : null}
            {tCommon("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
