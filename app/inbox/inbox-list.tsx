"use client"

import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Textarea } from "@/components/ui/textarea"
import { createAnswer } from "@/lib/actions/answers"

interface QuestionItem {
  id: number
  content: string
  isAnonymous: boolean
  createdAt: Date
  senderName: string
  senderAvatarUrl?: string | null
}

interface InboxListProps {
  questions: QuestionItem[]
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) {
    return "방금 전"
  }
  if (diffMins < 60) {
    return `${diffMins}분 전`
  }
  if (diffHours < 24) {
    return `${diffHours}시간 전`
  }
  if (diffDays < 7) {
    return `${diffDays}일 전`
  }
  return new Date(date).toLocaleDateString("ko-KR")
}

export function InboxList({ questions }: InboxListProps) {
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
            className="w-full text-left"
            key={question.id}
            onClick={() => handleQuestionClick(question)}
            type="button"
          >
            <Card className="transition-colors hover:bg-accent/50 active:bg-accent">
              <CardContent className="flex items-center gap-3">
                <Avatar className="size-10 flex-shrink-0">
                  {!question.isAnonymous && question.senderAvatarUrl ? (
                    <AvatarImage
                      alt={question.senderName}
                      src={question.senderAvatarUrl}
                    />
                  ) : null}
                  <AvatarFallback>
                    {question.senderName[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-foreground leading-relaxed">
                    {question.content}
                  </p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    {question.isAnonymous ? "익명" : "공개"} ·{" "}
                    {formatRelativeTime(question.createdAt)}
                  </p>
                </div>
                <HugeiconsIcon
                  className="size-5 flex-shrink-0 text-muted-foreground"
                  icon={ArrowRight01Icon}
                />
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <Drawer
        onOpenChange={(open) => !open && setSelectedQuestion(null)}
        open={!!selectedQuestion}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>질문에 답변하기</DrawerTitle>
            {selectedQuestion && (
              <DrawerDescription className="text-left">
                {selectedQuestion.content}
              </DrawerDescription>
            )}
          </DrawerHeader>
          <div className="px-4 py-4">
            <Textarea
              className="w-full"
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="답변을 입력하세요…"
              rows={4}
              value={answer}
            />
          </div>
          <DrawerFooter>
            <Button
              className="min-h-11"
              onClick={() => setSelectedQuestion(null)}
              type="button"
              variant="ghost"
            >
              취소
            </Button>
            <Button
              className="min-h-11"
              disabled={!answer.trim() || isSubmitting}
              onClick={handleSubmit}
              type="button"
            >
              {isSubmitting ? "전송 중…" : "답변하기"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
