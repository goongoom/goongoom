"use client"

import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { AnonymousIcon, LockIcon, UserIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { QuestionInputTrigger } from "@/components/questions/question-input-trigger"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

interface QuestionDrawerProps {
  recipientName: string
  recipientClerkId: string
  canAskAnonymously: boolean
  canAskPublic: boolean
  showSecurityNotice: boolean
  securityNotice: string | null
  submitAction: (formData: FormData) => Promise<void>
  requiresSignIn?: boolean
}

function SubmitButton() {
  const t = useTranslations("questions")
  const { pending } = useFormStatus()
  return (
    <Button
      className="w-full rounded-xl transition-all sm:h-13"
      disabled={pending}
      size="lg"
      type="submit"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <Spinner className="h-4 w-4 text-white" />
          {t("sending")}
        </span>
      ) : (
        <span className="flex items-center gap-2 font-semibold">
          <HugeiconsIcon className="size-5" icon={LockIcon} strokeWidth={2.5} />
          {t("sendQuestion")}
        </span>
      )}
    </Button>
  )
}

export function QuestionDrawer({
  recipientName,
  canAskAnonymously,
  canAskPublic,
  showSecurityNotice,
  securityNotice,
  submitAction,
  requiresSignIn = false,
}: QuestionDrawerProps) {
  const t = useTranslations("questions")
  const tAuth = useTranslations("auth")
  const tCommon = useTranslations("common")
  const [open, setOpen] = useState(false)
  const toastShownRef = useRef(false)

  useEffect(() => {
    if (
      open &&
      showSecurityNotice &&
      securityNotice &&
      !toastShownRef.current
    ) {
      toast.info(securityNotice)
      toastShownRef.current = true
    }
    if (!open) {
      toastShownRef.current = false
    }
  }, [open, showSecurityNotice, securityNotice])

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <QuestionInputTrigger onClick={() => setOpen(true)} />
      <DrawerContent className="pb-safe">
        <DrawerHeader className="text-left">
          <DrawerTitle className="font-bold text-xl leading-tight tracking-tight">
            <span className="text-primary">{recipientName}</span>{" "}
            {t("toRecipient", { recipientName: "" })}
            <br />
            {t("newQuestion")}
          </DrawerTitle>
        </DrawerHeader>

        <div className="max-h-[60vh] overflow-y-auto px-4 pb-6">
          {requiresSignIn ? (
            <div className="space-y-6">
              <p className="text-muted-foreground">{tAuth("loginRequired")}</p>
              <div className="flex gap-3">
                <SignInButton mode="modal">
                  <Button className="flex-1" size="lg" variant="outline">
                    {tCommon("login")}
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="flex-1" size="lg">
                    {tCommon("start")}
                  </Button>
                </SignUpButton>
              </div>
            </div>
          ) : (
            <form action={submitAction} className="space-y-6">
              <Textarea
                className="my-2 min-h-32 resize-none rounded-2xl border-border bg-muted/30 p-5 text-base focus:border-primary focus:ring-primary/20"
                name="question"
                placeholder={t("inputPlaceholder")}
                required
              />

              <div className="space-y-4">
                <Label className="ml-1 font-semibold text-foreground/90 text-sm">
                  {t("whoToAsk")}
                </Label>
                <RadioGroup
                  className="grid grid-cols-2 gap-2"
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
                          {t("anonymousOption")}
                        </p>
                        <p className="font-medium text-muted-foreground/70 text-xs">
                          {t("anonymousDescription")}
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
                          {t("identifiedOption")}
                        </p>
                        <p className="font-medium text-muted-foreground/70 text-xs">
                          {t("identifiedDescription")}
                        </p>
                      </div>
                    </Label>
                  )}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <SubmitButton />
                <p className="text-center text-muted-foreground/60 text-xs">
                  {t("termsAgreement")}
                </p>
              </div>
            </form>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
