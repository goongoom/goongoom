"use client"

import {
  AnonymousIcon,
  ArrowRight01Icon,
  SentIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { createAnswer } from "@/lib/actions/answers"

function getDicebearUrl(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
}

function getQuestionAvatarUrl(question: QuestionItem): string | undefined {
  if (question.isAnonymous) {
    return getDicebearUrl(question.anonymousAvatarSeed || `anon_${question.id}`)
  }
  return question.senderAvatarUrl ?? undefined
}

interface QuestionItem {
  id: string
  content: string
  isAnonymous: boolean
  createdAt: number
  senderName: string
  senderAvatarUrl?: string | null
  anonymousAvatarSeed?: string | null
}

interface InboxListProps {
  questions: QuestionItem[]
}

export function InboxList({ questions }: InboxListProps) {
  const t = useTranslations("answers")
  const tCommon = useTranslations("common")

  const router = useRouter()
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionItem | null>(
    null
  )
  const [answer, setAnswer] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleQuestionClick(question: QuestionItem) {
    setSelectedQuestion(question)
    setAnswer("")
  }

  async function handleSubmit() {
    if (!(selectedQuestion && answer.trim()) || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createAnswer({
        questionId: selectedQuestion.id,
        content: answer.trim(),
      })

      if (result.success) {
        setSelectedQuestion(null)
        setAnswer("")
        router.refresh()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="space-y-3">
        {questions.map((question) => (
          <button
            className="group w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            key={question.id}
            onClick={() => handleQuestionClick(question)}
            type="button"
          >
            <div className="flex items-start gap-4 rounded-2xl border border-border/50 bg-background p-4 transition-all group-hover:border-electric-blue/50 group-hover:bg-electric-blue/5 group-hover:ring-2 group-hover:ring-electric-blue/10 group-active:scale-[0.98]">
              <div className="relative flex-shrink-0">
                <Avatar className="size-12 ring-2 ring-background">
                  <AvatarImage
                    alt={question.senderName}
                    src={getQuestionAvatarUrl(question)}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-muted to-muted/50 font-semibold text-muted-foreground">
                    {question.senderName[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full ring-2 ring-background ${
                    question.isAnonymous
                      ? "bg-gradient-to-br from-purple to-purple/80"
                      : "bg-gradient-to-br from-electric-blue to-electric-blue/80"
                  }`}
                >
                  <HugeiconsIcon
                    className="size-3 text-white"
                    icon={question.isAnonymous ? AnonymousIcon : UserIcon}
                    strokeWidth={2.5}
                  />
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="line-clamp-2 font-medium text-foreground leading-relaxed">
                  {question.content}
                </p>
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <span
                    className={`font-medium ${question.isAnonymous ? "text-purple" : "text-electric-blue"}`}
                  >
                    {question.isAnonymous
                      ? tCommon("anonymous")
                      : question.senderName}
                  </span>
                  <span className="text-muted-foreground/60">·</span>
                  <span>
                    {formatDistanceToNow(question.createdAt, {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>

              <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-all group-hover:bg-electric-blue group-hover:text-white">
                <HugeiconsIcon
                  className="size-5"
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                />
              </div>
            </div>
          </button>
        ))}
      </div>

      <Drawer
        onOpenChange={(open) => !open && setSelectedQuestion(null)}
        open={!!selectedQuestion}
        repositionInputs={false}
      >
        <DrawerContent className="pb-safe">
          <div className="mx-auto w-full max-w-lg">
            <DrawerHeader className="text-left">
              <DrawerTitle className="font-bold text-xl tracking-tight">
                {t("answerDrawerTitle")}
              </DrawerTitle>
              {selectedQuestion && (
                <DrawerDescription className="mt-3 rounded-xl border border-border/50 bg-muted/30 p-4 text-left text-foreground">
                  <div className="mb-2 flex items-center gap-2">
                    <div
                      className={`flex size-6 items-center justify-center rounded-full ${
                        selectedQuestion.isAnonymous
                          ? "bg-gradient-to-br from-purple to-purple/80"
                          : "bg-gradient-to-br from-electric-blue to-electric-blue/80"
                      }`}
                    >
                      <HugeiconsIcon
                        className="size-3.5 text-white"
                        icon={
                          selectedQuestion.isAnonymous
                            ? AnonymousIcon
                            : UserIcon
                        }
                        strokeWidth={2.5}
                      />
                    </div>
                    <span
                      className={`font-semibold text-sm ${
                        selectedQuestion.isAnonymous
                          ? "text-purple"
                          : "text-electric-blue"
                      }`}
                    >
                      {selectedQuestion.isAnonymous
                        ? tCommon("anonymous")
                        : selectedQuestion.senderName}
                    </span>
                  </div>
                  <p className="leading-relaxed">{selectedQuestion.content}</p>
                </DrawerDescription>
              )}
            </DrawerHeader>

            <div className="space-y-2 px-4">
              <Textarea
                className="min-h-28 resize-none rounded-2xl border border-border/50 bg-muted/30 p-4 text-base transition-all focus:border-electric-blue focus:bg-background focus:ring-2 focus:ring-electric-blue/20"
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={t("answerPlaceholder")}
                rows={4}
                value={answer}
              />
            </div>

            <DrawerFooter className="pt-4">
              <Button
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-electric-blue to-electric-blue/90 font-semibold text-base ring-1 ring-electric-blue/50 transition-all hover:ring-2 hover:ring-electric-blue/70 disabled:opacity-70"
                disabled={!answer.trim() || isSubmitting}
                onClick={handleSubmit}
                type="button"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2.5">
                    <Spinner className="size-5 text-white" />
                    <span>{tCommon("submitting")}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2.5">
                    <HugeiconsIcon
                      className="size-5"
                      icon={SentIcon}
                      strokeWidth={2.5}
                    />
                    <span>{t("answerButton")}</span>
                  </span>
                )}
              </Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
