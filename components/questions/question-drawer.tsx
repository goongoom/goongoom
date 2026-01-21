"use client"

import { AnonymousIcon, LockIcon, UserIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"
import { useFormStatus } from "react-dom"
import { QuestionInputTrigger } from "@/components/questions/question-input-trigger"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

interface QuestionDrawerProps {
  recipientUsername: string
  recipientClerkId: string
  canAskAnonymously: boolean
  canAskPublic: boolean
  showSecurityNotice: boolean
  securityNotice: string | null
  submitAction: (formData: FormData) => Promise<void>
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      className="hover-lift tap-scale h-12 w-full rounded-xl border-electric-blue bg-electric-blue text-white shadow-electric-blue/20 shadow-lg transition-all hover:bg-electric-blue/90 hover:shadow-electric-blue/30 focus-visible:ring-electric-blue sm:h-13"
      disabled={pending}
      size="lg"
      type="submit"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          보내는 중...
        </span>
      ) : (
        <span className="flex items-center gap-2 font-semibold">
          <HugeiconsIcon className="size-5" icon={LockIcon} strokeWidth={2.5} />
          질문 보내기
        </span>
      )}
    </Button>
  )
}

export function QuestionDrawer({
  recipientUsername,
  canAskAnonymously,
  canAskPublic,
  showSecurityNotice,
  securityNotice,
  submitAction,
}: QuestionDrawerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <QuestionInputTrigger onClick={() => setOpen(true)} />
      <DrawerContent className="rounded-t-3xl border-none px-0 pt-3 pb-0 shadow-xl">
        <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-border/40" />

        <DrawerHeader className="space-y-2 px-6 pb-2 text-left">
          <DrawerTitle className="font-bold text-xl leading-tight tracking-tight">
            <span className="text-electric-blue">@{recipientUsername}</span>{" "}
            님에게
            <br />새 질문을 남겨보세요
          </DrawerTitle>
        </DrawerHeader>

        <div className="h-full max-h-svh overflow-y-auto px-6 pt-2 pb-6">
          <form action={submitAction} className="space-y-6">
            <Textarea
              className="min-h-32 resize-none rounded-2xl border-border bg-muted/30 p-5 text-base shadow-sm focus:border-electric-blue focus:ring-electric-blue/20"
              name="question"
              placeholder="질문을 입력하세요…"
              required
            />

            {showSecurityNotice && securityNotice && (
              <Alert className="rounded-2xl border-none bg-electric-blue/10 text-electric-blue dark:bg-electric-blue/20">
                <AlertDescription className="font-medium text-electric-blue/80 text-xs leading-relaxed">
                  {securityNotice}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <Label className="ml-1 font-semibold text-foreground/90 text-sm">
                누구로 질문할까요?
              </Label>
              <RadioGroup
                className="grid grid-cols-2 gap-3"
                defaultValue={canAskAnonymously ? "anonymous" : "public"}
                name="questionType"
              >
                {canAskAnonymously && (
                  <Label className="group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 bg-background p-4 transition-all hover:border-electric-blue/50 hover:bg-muted/30 has-data-checked:border-electric-blue has-data-checked:bg-electric-blue/5">
                    <RadioGroupItem
                      className="pointer-events-none absolute opacity-0"
                      id="r-anonymous"
                      value="anonymous"
                    />
                    <div className="rounded-full bg-gradient-to-br from-muted to-muted/50 p-3 text-muted-foreground transition-colors group-has-data-checked:from-electric-blue group-has-data-checked:to-electric-blue/90 group-has-data-checked:text-white">
                      <HugeiconsIcon
                        className="size-6"
                        icon={AnonymousIcon}
                        strokeWidth={2}
                      />
                    </div>
                    <div className="space-y-0.5 text-center">
                      <p className="font-bold text-foreground text-sm group-has-data-checked:text-electric-blue">
                        익명
                      </p>
                      <p className="font-medium text-muted-foreground/70 text-xs">
                        익명으로 질문합니다
                      </p>
                    </div>
                  </Label>
                )}
                {canAskPublic && (
                  <Label className="group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-border/60 bg-background p-4 transition-all hover:border-electric-blue/50 hover:bg-muted/30 has-data-checked:border-electric-blue has-data-checked:bg-electric-blue/5">
                    <RadioGroupItem
                      className="pointer-events-none absolute opacity-0"
                      id="r-public"
                      value="public"
                    />
                    <div className="rounded-full bg-gradient-to-br from-muted to-muted/50 p-3 text-muted-foreground transition-colors group-has-data-checked:from-electric-blue group-has-data-checked:to-electric-blue/90 group-has-data-checked:text-white">
                      <HugeiconsIcon
                        className="size-6"
                        icon={UserIcon}
                        strokeWidth={2}
                      />
                    </div>
                    <div className="space-y-0.5 text-center">
                      <p className="font-bold text-foreground text-sm group-has-data-checked:text-electric-blue">
                        공개
                      </p>
                      <p className="font-medium text-muted-foreground/70 text-xs">
                        내 이름으로 질문합니다
                      </p>
                    </div>
                  </Label>
                )}
              </RadioGroup>
            </div>

            <div className="space-y-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <SubmitButton />
              <p className="text-center text-muted-foreground/60 text-xs">
                질문 시 사용 약관에 동의하게 됩니다
              </p>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
