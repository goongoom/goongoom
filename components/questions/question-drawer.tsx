"use client"

import { SignInButton, SignUpButton } from "@clerk/nextjs"
import {
  AnonymousIcon,
  LockIcon,
  SentIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useFormStatus } from "react-dom"
import { QuestionInputTrigger } from "@/components/questions/question-input-trigger"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
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
  submitAction: (formData: FormData) => Promise<void>
  requiresSignIn?: boolean
}

function SubmitButton() {
  const t = useTranslations("questions")
  const { pending } = useFormStatus()
  return (
    <Button
      className="h-14 w-full rounded-2xl bg-gradient-to-r from-electric-blue to-electric-blue/90 font-semibold text-base ring-1 ring-electric-blue/50 transition-all hover:ring-2 hover:ring-electric-blue/70 disabled:opacity-70"
      disabled={pending}
      size="lg"
      type="submit"
    >
      {pending ? (
        <span className="flex items-center gap-2.5">
          <Spinner className="size-5 text-white" />
          <span>{t("sending")}</span>
        </span>
      ) : (
        <span className="flex items-center gap-2.5">
          <HugeiconsIcon className="size-5" icon={SentIcon} strokeWidth={2.5} />
          <span>{t("sendQuestion")}</span>
        </span>
      )}
    </Button>
  )
}

export function QuestionDrawer({
  recipientName,
  canAskAnonymously,
  canAskPublic,
  submitAction,
  requiresSignIn = false,
}: QuestionDrawerProps) {
  const t = useTranslations("questions")
  const tAuth = useTranslations("auth")
  const tCommon = useTranslations("common")
  const tRestrictions = useTranslations("restrictions")
  const [open, setOpen] = useState(false)

  return (
    <Drawer onOpenChange={setOpen} open={open}>
      <QuestionInputTrigger onClick={() => setOpen(true)} />
      <DrawerContent className="pb-safe">
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader className="pb-2 text-left">
            <DrawerTitle className="font-bold text-2xl tracking-tight">
              <span className="bg-gradient-to-r from-electric-blue to-purple bg-clip-text text-transparent">
                {recipientName}
              </span>
              <span className="text-foreground">
                {" "}
                {t("toRecipient", { recipientName: "" })}
              </span>
            </DrawerTitle>
            <DrawerDescription className="text-base">
              {t("newQuestion")}
            </DrawerDescription>
          </DrawerHeader>

          <div className="max-h-[70vh] overflow-y-auto px-4 pb-8">
            {requiresSignIn ? (
              <div className="space-y-6 py-4">
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-6 text-center">
                  <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-electric-blue/20 to-purple/20">
                    <HugeiconsIcon
                      className="size-7 text-electric-blue"
                      icon={LockIcon}
                      strokeWidth={2}
                    />
                  </div>
                  <p className="mb-1 font-semibold text-foreground">
                    {tAuth("loginRequired")}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {tRestrictions("anonymousLoginRequired")}
                  </p>
                </div>
                <div className="flex gap-3">
                  <SignInButton mode="modal">
                    <Button
                      className="h-12 flex-1 rounded-xl font-semibold"
                      size="lg"
                      variant="outline"
                    >
                      {tCommon("login")}
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button
                      className="h-12 flex-1 rounded-xl bg-gradient-to-r from-electric-blue to-electric-blue/90 font-semibold ring-1 ring-electric-blue/50"
                      size="lg"
                    >
                      {tCommon("start")}
                    </Button>
                  </SignUpButton>
                </div>
              </div>
            ) : (
              <form action={submitAction} className="space-y-6 py-2">
                <div className="space-y-2">
                  <Label className="ml-1 font-semibold text-foreground/90 text-sm">
                    {t("inputPlaceholder")}
                  </Label>
                  <Textarea
                    className="min-h-28 resize-none rounded-2xl border border-border/50 bg-muted/30 p-4 text-base transition-all focus:border-electric-blue focus:bg-background focus:ring-2 focus:ring-electric-blue/20"
                    name="question"
                    placeholder={t("inputPlaceholder")}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label className="ml-1 font-semibold text-foreground/90 text-sm">
                    {t("whoToAsk")}
                  </Label>
                  <RadioGroup
                    className="grid grid-cols-2 gap-3"
                    defaultValue={canAskAnonymously ? "anonymous" : "public"}
                    name="questionType"
                  >
                    <Label
                      className={`group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 bg-background p-5 transition-all ${
                        canAskAnonymously
                          ? "cursor-pointer border-border/40 hover:border-electric-blue/50 hover:bg-electric-blue/5 has-data-checked:border-electric-blue has-data-checked:bg-electric-blue/5 has-data-checked:ring-2 has-data-checked:ring-electric-blue/20"
                          : "cursor-not-allowed border-border/20 opacity-50"
                      }`}
                    >
                      <RadioGroupItem
                        className="pointer-events-none absolute opacity-0"
                        disabled={!canAskAnonymously}
                        id="r-anonymous"
                        value="anonymous"
                      />
                      <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/50 text-muted-foreground transition-all group-has-data-checked:from-electric-blue group-has-data-checked:to-electric-blue/80 group-has-data-checked:text-white group-has-data-checked:ring-2 group-has-data-checked:ring-white/30">
                        <HugeiconsIcon
                          className="size-7"
                          icon={AnonymousIcon}
                          strokeWidth={1.8}
                        />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="font-bold text-foreground text-sm transition-colors group-has-data-checked:text-electric-blue">
                          {t("anonymousOption")}
                        </p>
                        <p className="font-medium text-muted-foreground/70 text-xs leading-relaxed">
                          {t("anonymousDescription")}
                        </p>
                      </div>
                    </Label>

                    <Label
                      className={`group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 bg-background p-5 transition-all ${
                        canAskPublic
                          ? "cursor-pointer border-border/40 hover:border-electric-blue/50 hover:bg-electric-blue/5 has-data-checked:border-electric-blue has-data-checked:bg-electric-blue/5 has-data-checked:ring-2 has-data-checked:ring-electric-blue/20"
                          : "cursor-not-allowed border-border/20 opacity-50"
                      }`}
                    >
                      <RadioGroupItem
                        className="pointer-events-none absolute opacity-0"
                        disabled={!canAskPublic}
                        id="r-public"
                        value="public"
                      />
                      <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/50 text-muted-foreground transition-all group-has-data-checked:from-electric-blue group-has-data-checked:to-electric-blue/80 group-has-data-checked:text-white group-has-data-checked:ring-2 group-has-data-checked:ring-white/30">
                        <HugeiconsIcon
                          className="size-7"
                          icon={UserIcon}
                          strokeWidth={1.8}
                        />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="font-bold text-foreground text-sm transition-colors group-has-data-checked:text-electric-blue">
                          {t("identifiedOption")}
                        </p>
                        <p className="font-medium text-muted-foreground/70 text-xs leading-relaxed">
                          {canAskPublic
                            ? t("identifiedDescription")
                            : tRestrictions("loginForIdentified")}
                        </p>
                      </div>
                    </Label>
                  </RadioGroup>
                </div>

                <div className="space-y-3 pt-2">
                  <SubmitButton />
                  <p className="text-balance text-center text-muted-foreground/50 text-xs leading-relaxed">
                    {t("termsAgreement")}
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
